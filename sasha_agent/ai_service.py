import os
import yaml
import logging
from typing import List, Dict, Optional
import google.generativeai as genai
from huggingface_client import HuggingFaceClient
from datetime import datetime

class ConversationMemory:
    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.messages: List[Dict] = []
        self.last_updated = datetime.now()

    def add_message(self, role: str, content: str):
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        if len(self.messages) > self.max_history:
            self.messages.pop(0)
        self.last_updated = datetime.now()

    def get_context(self) -> List[Dict]:
        return self.messages

    def clear(self):
        self.messages.clear()
        self.last_updated = datetime.now()

class AIService:
    def __init__(self, config_path: str = 'ai_config.yaml'):
        # Load configuration
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)

        # Initialize Gemini
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        self.gemini_model = genai.GenerativeModel(
            model_name=self.config['gemini']['model'],
            generation_config={
                'temperature': self.config['gemini']['temperature'],
                'max_output_tokens': self.config['gemini']['max_tokens'],
                'top_p': self.config['gemini']['top_p'],
                'top_k': self.config['gemini']['top_k']
            }
        )

        # Initialize Hugging Face as fallback
        self.hf_client = HuggingFaceClient(os.getenv('HUGGINGFACE_API_KEY'))
        
        # Initialize conversation memory
        self.conversations: Dict[str, ConversationMemory] = {}
        
        logging.info('AIService initialized with Gemini and Hugging Face')

    def _get_conversation(self, session_id: str) -> ConversationMemory:
        if session_id not in self.conversations:
            self.conversations[session_id] = ConversationMemory(
                max_history=self.config['conversation']['max_history']
            )
        return self.conversations[session_id]

    def _build_prompt(self, message: str, conversation: ConversationMemory, mode: str = 'default') -> str:
        system_prompt = self.config['system_prompts'][mode]
        context = conversation.get_context()
        
        # Build conversation history
        history = "\n".join([
            f"{msg['role']}: {msg['content']}"
            for msg in context
        ])
        
        return f"{system_prompt}\n\nConversation History:\n{history}\n\nUser: {message}\nSasha:"

    async def generate_response(self, message: str, session_id: str, mode: str = 'default') -> str:
        conversation = self._get_conversation(session_id)
        conversation.add_message("user", message)
        
        try:
            # Try Gemini first
            prompt = self._build_prompt(message, conversation, mode)
            response = self.gemini_model.generate_content(prompt)
            
            if response and response.text:
                ai_response = response.text.strip()
                conversation.add_message("assistant", ai_response)
                return ai_response
            
            raise Exception("Empty response from Gemini")
            
        except Exception as e:
            logging.warning(f"Gemini failed: {str(e)}. Falling back to Hugging Face.")
            
            try:
                # Fallback to Hugging Face
                hf_response = self.hf_client.generate_response(
                    message,
                    model=self.config['huggingface']['model']
                )
                
                if hf_response and not hf_response.startswith('[HuggingFace'):
                    conversation.add_message("assistant", hf_response)
                    return hf_response
                    
                raise Exception("Invalid response from Hugging Face")
                
            except Exception as hf_error:
                logging.error(f"Both AI services failed: {str(hf_error)}")
                fallback_response = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
                conversation.add_message("assistant", fallback_response)
                return fallback_response

    def clear_conversation(self, session_id: str):
        if session_id in self.conversations:
            self.conversations[session_id].clear() 