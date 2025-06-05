import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from meta_integration_manager import MetaIntegrationManager
from open_source_integrations import OpenSourceIntegrations
from token_manager import TokenManager
from google_ai_integration import GoogleAIIntegration
from voice_chat import VoiceChat

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Sasha:
    def __init__(self, config_path: str = "ai_config.yaml"):
        """Initialize Sasha Meta Agent with all required components."""
        self.config_path = config_path
        self.config = self._load_config()
        self.token_manager = TokenManager()
        self.meta_manager = MetaIntegrationManager(config_path)
        self.open_source = OpenSourceIntegrations()
        self.google_ai = GoogleAIIntegration()
        self.voice_chat = None
        self._initialize_components()
        
    def _load_config(self) -> Dict[str, Any]:
        """Load Sasha configuration."""
        try:
            import yaml
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load config: {e}")
            return {}
            
    def _initialize_components(self):
        """Initialize all Sasha components."""
        try:
            # Initialize token manager
            self.token_manager.load_tokens()
            
            # Initialize meta integration manager
            self.meta_manager._initialize_models()
            
            # Initialize open source integrations
            self.open_source.initialize()
            
            # Initialize voice chat if enabled
            if self.config.get('features', {}).get('voice_chat', False):
                self.voice_chat = VoiceChat(self.google_ai)
            
            logger.info("Successfully initialized all Sasha components")
        except Exception as e:
            logger.error(f"Failed to initialize components: {e}")
            raise
            
    def start_voice_chat(self, callback: Optional[callable] = None):
        """Start voice chat mode."""
        if not self.voice_chat:
            self.voice_chat = VoiceChat(self.google_ai)
            
        def handle_voice_input(text: str):
            """Handle voice input and generate response."""
            try:
                # Process the request
                response = self.evaluate_request({
                    'type': 'chat',
                    'details': {
                        'text': text,
                        'mode': 'voice'
                    }
                })
                
                # Speak the response
                if isinstance(response, dict) and 'text' in response:
                    self.voice_chat.speak(response['text'])
                elif isinstance(response, str):
                    self.voice_chat.speak(response)
                    
                # Call custom callback if provided
                if callback:
                    callback(text, response)
                    
            except Exception as e:
                logger.error(f"Failed to handle voice input: {e}")
                self.voice_chat.speak("I encountered an error processing your request.")
                
        self.voice_chat.start_listening(handle_voice_input)
        
    def stop_voice_chat(self):
        """Stop voice chat mode."""
        if self.voice_chat:
            self.voice_chat.stop_listening()
            
    def get_status(self) -> Dict[str, Any]:
        """Get comprehensive Sasha status."""
        status = {
            'meta_manager': self.meta_manager.get_integration_status(),
            'open_source': self.open_source.get_status(),
            'tokens': self.token_manager.get_token_status(),
            'config': {
                'models': self.config.get('models', {}),
                'features': self.config.get('features', {}),
                'integrations': self.config.get('integrations', {})
            }
        }
        
        # Add voice chat status if enabled
        if self.voice_chat:
            status['voice_chat'] = {
                'is_listening': self.voice_chat.is_listening,
                'is_speaking': self.voice_chat.is_speaking,
                'available_voices': self.voice_chat.get_available_voices()
            }
            
        return status
        
    def evaluate_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate and process a request through Sasha."""
        try:
            # Get meta manager evaluation
            evaluation = self.meta_manager.evaluate_integration(
                request.get('type', 'unknown'),
                request.get('details', {})
            )
            
            # If approved, process through appropriate integration
            if evaluation.get('decision') == 'approve':
                if request.get('type') == 'github':
                    return self.open_source.process_github_request(request)
                elif request.get('type') == 'huggingface':
                    return self.open_source.process_huggingface_request(request)
                elif request.get('type') == 'chat':
                    # Handle chat requests
                    text = request.get('details', {}).get('text', '')
                    response = self.google_ai.generate_text(text)
                    return {
                        'text': response.get('text', ''),
                        'candidates': response.get('candidates', []),
                        'prompt_feedback': response.get('prompt_feedback', {})
                    }
                else:
                    return self.meta_manager.process_request(request)
            
            return evaluation
            
        except Exception as e:
            logger.error(f"Failed to process request: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }
            
    def get_recommendations(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Get AI-powered recommendations for requirements."""
        try:
            # Get meta manager recommendations
            recommendations = self.meta_manager.recommend_integrations(requirements)
            
            # Enhance with open source options
            open_source_recs = self.open_source.get_recommendations(requirements)
            
            return {
                'meta_recommendations': recommendations,
                'open_source_recommendations': open_source_recs
            }
            
        except Exception as e:
            logger.error(f"Failed to get recommendations: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }
            
    def cleanup(self):
        """Cleanup all resources."""
        try:
            if self.voice_chat:
                self.voice_chat.cleanup()
        except Exception as e:
            logger.error(f"Failed to cleanup: {e}")

def initialize_sasha(config_path: str = "ai_config.yaml") -> Optional[Sasha]:
    """Initialize Sasha with error handling."""
    try:
        return Sasha(config_path)
    except Exception as e:
        logger.error(f"Failed to initialize Sasha: {e}")
        return None 