import os
import yaml
import logging
from typing import List, Dict, Optional
import google.generativeai as genai
from huggingface_client import HuggingFaceClient
from datetime import datetime
from transformers import pipeline
import json
import uuid
from langgraph.graph import StateGraph, END
from google.cloud import texttospeech, firestore, storage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SystemAccess:
    def __init__(self):
        self.audit_log = []
        self.permissions = {}
        self.pending_approvals = {}
        self.personality_memory = {}
    
    def log_access(self, action: str, details: Dict):
        self.audit_log.append({
            'timestamp': datetime.utcnow().isoformat(),
            'action': action,
            'details': details
        })
    
    def request_approval(self, action: str, details: Dict) -> str:
        approval_id = str(uuid.uuid4())
        self.pending_approvals[approval_id] = {
            'action': action,
            'details': details,
            'status': 'pending',
            'timestamp': datetime.utcnow().isoformat()
        }
        return approval_id
    
    def grant_permission(self, resource: str, level: str):
        self.permissions[resource] = {
            'level': level,
            'granted_at': datetime.utcnow().isoformat()
        }
        self.log_access('permission_granted', {
            'resource': resource,
            'level': level
        })

class TextToSpeech:
    def __init__(self, config: Dict):
        self.client = texttospeech.TextToSpeechClient()
        self.voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name=config['voice_id'],
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )
        self.audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            pitch=config['pitch'],
            speaking_rate=config['speaking_rate']
        )
    
    def speak(self, text: str) -> str:
        synthesis_input = texttospeech.SynthesisInput(text=text)
        response = self.client.synthesize_speech(
            input=synthesis_input,
            voice=self.voice,
            audio_config=self.audio_config
        )
        
        # Save to temporary file
        filename = f"temp_{uuid.uuid4()}.mp3"
        with open(filename, "wb") as out:
            out.write(response.audio_content)
        return filename

class DecisionGraph:
    def __init__(self, config: Dict):
        self.graph = self._build_graph()
        self.threshold = config['decision_threshold']
        self.escalation_enabled = config['escalation_enabled']
    
    def _build_graph(self):
        graph = StateGraph()
        
        # Add nodes
        graph.add_node("retrieve_context", self._retrieve_context)
        graph.add_node("decide_action", self._decide_action)
        graph.add_node("execute_action", self._execute_action)
        graph.add_node("escalate", self._escalate)
        
        # Set entry point
        graph.set_entry_point("retrieve_context")
        
        # Add edges
        graph.add_edge("retrieve_context", "decide_action")
        graph.add_conditional_edges("decide_action", {
            "safe": "execute_action",
            "unsafe": "escalate"
        })
        graph.add_edge("execute_action", END)
        graph.add_edge("escalate", END)
        
        return graph.compile()
    
    def _retrieve_context(self, state: Dict) -> Dict:
        # Add context from memory, preferences, etc.
        return state
    
    def _decide_action(self, state: Dict) -> str:
        # Analyze the action for safety
        if any(word in state.get("input", "").lower() for word in ["delete", "remove", "drop", "destroy"]):
            return "unsafe"
        return "safe"
    
    def _execute_action(self, state: Dict) -> Dict:
        # Execute the safe action
        return state
    
    def _escalate(self, state: Dict) -> Dict:
        # Handle unsafe actions by escalating
        state["escalated"] = True
        return state

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
    def __init__(self, config_path: str):
        self.config = self._load_config(config_path)
        self.conversations: Dict[str, List[Dict]] = {}
        self.user_preferences: Dict[str, Dict] = {}
        self.system_access = SystemAccess()
        self.tts = TextToSpeech(self.config['integrations']['text_to_speech'])
        self.decision_graph = DecisionGraph(self.config['integrations']['langgraph'])
        self._initialize_models()
        self._initialize_storage()

    def _load_config(self, config_path: str) -> dict:
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load config: {str(e)}")
            raise

    def _initialize_models(self):
        try:
            # Initialize Gemini
            genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
            self.gemini_model = genai.GenerativeModel(
                model_name=self.config['gemini']['model'],
                generation_config={
                    'temperature': self.config['gemini']['temperature'],
                    'max_output_tokens': self.config['gemini']['max_tokens'],
                    'top_p': self.config['gemini']['top_p'],
                    'top_k': self.config['gemini']['top_k'],
                }
            )
            
            # Initialize Hugging Face fallback
            self.hf_model = pipeline(
                'text-generation',
                model=self.config['huggingface']['model'],
                max_length=self.config['huggingface']['max_length'],
                temperature=self.config['huggingface']['temperature']
            )
            
            logger.info("Successfully initialized AI models")
        except Exception as e:
            logger.error(f"Failed to initialize AI models: {str(e)}")
            raise

    def _initialize_storage(self):
        try:
            if self.config['integrations']['firestore']['enabled']:
                self.firestore_client = firestore.Client()
                self.memory_collection = self.firestore_client.collection(
                    self.config['integrations']['firestore']['collection']
                )
            
            if self.config['integrations']['storage']['enabled']:
                self.storage_client = storage.Client()
                self.assets_bucket = self.storage_client.bucket(
                    self.config['integrations']['storage']['bucket']
                )
            
            logger.info("Successfully initialized storage clients")
        except Exception as e:
            logger.error(f"Failed to initialize storage: {str(e)}")
            raise

    def _get_conversation_history(self, session_id: str) -> str:
        if session_id not in self.conversations:
            return ""
        
        history = self.conversations[session_id]
        max_history = self.config['conversation']['max_history']
        recent_history = history[-max_history:]
        
        return "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Sasha'}: {msg['content']}"
            for msg in recent_history
        ])

    def _get_user_preferences(self, session_id: str) -> Dict:
        return self.user_preferences.get(session_id, {})

    def _update_user_preferences(self, session_id: str, message: str):
        if session_id not in self.user_preferences:
            self.user_preferences[session_id] = {}
        
        # Analyze message for preferences
        if "casual" in message.lower():
            self.user_preferences[session_id]['tone'] = 'casual'
        elif "formal" in message.lower():
            self.user_preferences[session_id]['tone'] = 'formal'
        
        if "detailed" in message.lower() or "comprehensive" in message.lower():
            self.user_preferences[session_id]['detail_level'] = 'comprehensive'
        elif "brief" in message.lower() or "concise" in message.lower():
            self.user_preferences[session_id]['detail_level'] = 'concise'

    def _build_system_prompt(self, mode: str, session_id: str) -> str:
        base_prompt = self.config['system_prompts'].get(mode, self.config['system_prompts']['default'])
        
        # Add user preferences if available
        prefs = self._get_user_preferences(session_id)
        if prefs:
            preference_text = "Based on your preferences:\n"
            if 'tone' in prefs:
                preference_text += f"- Using a {prefs['tone']} tone\n"
            if 'detail_level' in prefs:
                preference_text += f"- Providing {prefs['detail_level']} responses\n"
            base_prompt += f"\n\n{preference_text}"
        
        # Add system access context
        if self.system_access.permissions:
            access_text = "\nCurrent System Access:\n"
            for resource, details in self.system_access.permissions.items():
                access_text += f"- {resource}: {details['level']}\n"
            base_prompt += f"\n{access_text}"
        
        return base_prompt

    def _check_permission(self, action: str, resource: str) -> bool:
        if action in self.config['security']['require_approval_for']:
            approval_id = self.system_access.request_approval(action, {
                'resource': resource,
                'action': action
            })
            return False, f"Approval required for {action} on {resource}. Approval ID: {approval_id}"
        
        if resource in self.system_access.permissions:
            return True, "Permission granted"
        
        return False, f"No permission for {action} on {resource}"

    async def generate_response(self, message: str, session_id: str, mode: str = "default") -> Dict:
        try:
            # Update user preferences based on the message
            self._update_user_preferences(session_id, message)
            
            # Get conversation history
            history = self._get_conversation_history(session_id)
            
            # Build system prompt with preferences and access context
            system_prompt = self._build_system_prompt(mode, session_id)
            
            # Store the message in conversation history
            if session_id not in self.conversations:
                self.conversations[session_id] = []
            self.conversations[session_id].append({
                'role': 'user',
                'content': message
            })
            
            # Log the interaction
            self.system_access.log_access('user_message', {
                'session_id': session_id,
                'message_length': len(message)
            })
            
            # Process through decision graph
            decision_result = self.decision_graph.graph.invoke({
                "input": message,
                "context": {
                    "history": history,
                    "preferences": self._get_user_preferences(session_id),
                    "permissions": self.system_access.permissions
                }
            })
            
            # Generate response using Gemini
            try:
                chat = self.gemini_model.start_chat(history=[])
                response = chat.send_message(
                    f"{system_prompt}\n\nConversation History:\n{history}\n\nUser: {message}\nSasha:"
                )
                response_text = response.text
            except Exception as e:
                logger.warning(f"Gemini failed, falling back to Hugging Face: {str(e)}")
                # Fallback to Hugging Face
                response = self.hf_model(
                    f"{system_prompt}\n\nConversation History:\n{history}\n\nUser: {message}\nSasha:",
                    max_length=self.config['huggingface']['max_length'],
                    num_return_sequences=1
                )
                response_text = response[0]['generated_text'].split('Sasha:')[-1].strip()
            
            # Generate voice response
            voice_path = self.tts.speak(response_text)
            
            # Store the response in conversation history
            self.conversations[session_id].append({
                'role': 'assistant',
                'content': response_text
            })
            
            # Log the response
            self.system_access.log_access('assistant_response', {
                'session_id': session_id,
                'response_length': len(response_text),
                'voice_generated': True
            })
            
            return {
                "response": response_text,
                "voice": voice_path,
                "escalated": decision_result.get("escalated", False)
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise

    def clear_conversation(self, session_id: str):
        if session_id in self.conversations:
            del self.conversations[session_id]
        if session_id in self.user_preferences:
            del self.user_preferences[session_id]
        
        # Log the conversation clear
        self.system_access.log_access('conversation_cleared', {
            'session_id': session_id
        })

    def get_audit_log(self) -> List[Dict]:
        return self.system_access.audit_log

    def get_pending_approvals(self) -> Dict:
        return self.system_access.pending_approvals

    def approve_action(self, approval_id: str) -> bool:
        if approval_id in self.system_access.pending_approvals:
            approval = self.system_access.pending_approvals[approval_id]
            approval['status'] = 'approved'
            approval['approved_at'] = datetime.utcnow().isoformat()
            
            # Grant permission if it was a permission request
            if approval['action'] == 'permission_change':
                self.system_access.grant_permission(
                    approval['details']['resource'],
                    approval['details']['level']
                )
            
            return True
        return False 