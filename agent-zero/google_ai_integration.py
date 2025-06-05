import os
import logging
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from google.cloud import texttospeech
from google.cloud import vision
import vertexai
from vertexai.preview.generative_models import GenerativeModel, Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleAIIntegration:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Google AI integration with all available services."""
        self.api_key = api_key or os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("Google API key not found")
            
        self._initialize_services()
        
    def _initialize_services(self):
        """Initialize all Google AI services."""
        try:
            # Initialize Gemini
            genai.configure(api_key=self.api_key)
            self.gemini_model = genai.GenerativeModel('gemini-pro')
            
            # Initialize Vertex AI
            vertexai.init(project="mport-media-group", location="us-central1")
            self.vertex_model = GenerativeModel("gemini-pro-vision")
            
            # Initialize Text-to-Speech
            self.tts_client = texttospeech.TextToSpeechClient()
            
            # Initialize Vision
            self.vision_client = vision.ImageAnnotatorClient()
            
            logger.info("Successfully initialized Google AI services")
        except Exception as e:
            logger.error(f"Failed to initialize Google AI services: {e}")
            raise
            
    def generate_text(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate text using Gemini Pro."""
        try:
            response = self.gemini_model.generate_content(prompt, **kwargs)
            return {
                'text': response.text,
                'candidates': response.candidates,
                'prompt_feedback': response.prompt_feedback
            }
        except Exception as e:
            logger.error(f"Text generation failed: {e}")
            return {'error': str(e)}
            
    def generate_code(self, prompt: str, language: str = "python") -> Dict[str, Any]:
        """Generate code using Gemini Pro."""
        try:
            full_prompt = f"Generate {language} code for: {prompt}"
            response = self.gemini_model.generate_content(full_prompt)
            return {
                'code': response.text,
                'language': language,
                'candidates': response.candidates
            }
        except Exception as e:
            logger.error(f"Code generation failed: {e}")
            return {'error': str(e)}
            
    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """Analyze image using Google Vision API."""
        try:
            with open(image_path, 'rb') as image_file:
                content = image_file.read()
                
            image = vision.Image(content=content)
            response = self.vision_client.annotate_image({
                'image': image,
                'features': [
                    {'type_': vision.Feature.Type.LABEL_DETECTION},
                    {'type_': vision.Feature.Type.TEXT_DETECTION},
                    {'type_': vision.Feature.Type.OBJECT_LOCALIZATION},
                    {'type_': vision.Feature.Type.FACE_DETECTION}
                ]
            })
            
            return {
                'labels': [label.description for label in response.label_annotations],
                'text': [text.description for text in response.text_annotations],
                'objects': [obj.name for obj in response.localized_object_annotations],
                'faces': len(response.face_annotations)
            }
        except Exception as e:
            logger.error(f"Image analysis failed: {e}")
            return {'error': str(e)}
            
    def text_to_speech(self, text: str, voice_name: str = "en-US-Neural2-F") -> Dict[str, Any]:
        """Convert text to speech using Google TTS."""
        try:
            synthesis_input = texttospeech.SynthesisInput(text=text)
            voice = texttospeech.VoiceSelectionParams(
                language_code="en-US",
                name=voice_name
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3
            )
            
            response = self.tts_client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            return {
                'audio_content': response.audio_content,
                'voice': voice_name,
                'encoding': 'MP3'
            }
        except Exception as e:
            logger.error(f"Text-to-speech conversion failed: {e}")
            return {'error': str(e)}
            
    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available Google AI models."""
        return [
            {
                'name': 'gemini-pro',
                'type': 'text',
                'capabilities': ['text-generation', 'code-generation', 'chat']
            },
            {
                'name': 'gemini-pro-vision',
                'type': 'multimodal',
                'capabilities': ['image-analysis', 'text-generation', 'chat']
            },
            {
                'name': 'text-to-speech',
                'type': 'audio',
                'capabilities': ['text-to-speech']
            },
            {
                'name': 'vision',
                'type': 'vision',
                'capabilities': ['image-analysis', 'object-detection', 'text-detection']
            }
        ]
        
    def get_status(self) -> Dict[str, Any]:
        """Get status of Google AI services."""
        try:
            # Test Gemini
            gemini_test = self.generate_text("Test connection")
            gemini_status = 'error' not in gemini_test
            
            # Test Vision
            vision_status = False
            try:
                self.vision_client.get_operation('test')
                vision_status = True
            except:
                pass
                
            # Test TTS
            tts_status = False
            try:
                self.tts_client.list_voices()
                tts_status = True
            except:
                pass
                
            return {
                'gemini': {
                    'status': 'active' if gemini_status else 'error',
                    'error': gemini_test.get('error') if not gemini_status else None
                },
                'vision': {
                    'status': 'active' if vision_status else 'error'
                },
                'tts': {
                    'status': 'active' if tts_status else 'error'
                }
            }
        except Exception as e:
            logger.error(f"Status check failed: {e}")
            return {'error': str(e)}

def initialize_google_ai(api_key: Optional[str] = None) -> Optional[GoogleAIIntegration]:
    """Initialize Google AI integration with error handling."""
    try:
        return GoogleAIIntegration(api_key)
    except Exception as e:
        logger.error(f"Failed to initialize Google AI: {e}")
        return None 