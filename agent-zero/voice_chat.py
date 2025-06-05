import os
import logging
import queue
import threading
import time
from typing import Optional, Callable, Dict, Any, List
from google.cloud import speech
from google.cloud import texttospeech
import pyaudio
import wave
import tempfile
import numpy as np
from google_ai_integration import GoogleAIIntegration
from transformers import pipeline, AutoModelForSpeechSeq2Seq, AutoProcessor, AutoModelForTextToSpeech
import torch
from dataclasses import dataclass
from enum import Enum
import psutil
import GPUtil

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelType(Enum):
    GCP = "gcp"
    HUGGINGFACE = "huggingface"

@dataclass
class ModelMetrics:
    latency: float
    accuracy: float
    resource_usage: float
    availability: float
    last_used: float

class ModelSelector:
    def __init__(self):
        self.metrics: Dict[str, ModelMetrics] = {}
        self.model_history: List[Dict[str, Any]] = []
        self._initialize_metrics()
        
    def _initialize_metrics(self):
        """Initialize metrics for all available models."""
        self.metrics = {
            "gcp_speech": ModelMetrics(0.0, 0.95, 0.1, 0.99, 0.0),
            "gcp_tts": ModelMetrics(0.0, 0.95, 0.1, 0.99, 0.0),
            "whisper": ModelMetrics(0.0, 0.90, 0.8, 1.0, 0.0),
            "speecht5": ModelMetrics(0.0, 0.85, 0.7, 1.0, 0.0)
        }
        
    def update_metrics(self, model_name: str, metrics: Dict[str, float]):
        """Update metrics for a specific model."""
        if model_name in self.metrics:
            current = self.metrics[model_name]
            self.metrics[model_name] = ModelMetrics(
                latency=metrics.get('latency', current.latency),
                accuracy=metrics.get('accuracy', current.accuracy),
                resource_usage=metrics.get('resource_usage', current.resource_usage),
                availability=metrics.get('availability', current.availability),
                last_used=time.time()
            )
            
    def select_model(self, task_type: str) -> str:
        """Select the best model based on current metrics and system state."""
        try:
            # Get system resources
            cpu_percent = psutil.cpu_percent()
            memory_percent = psutil.virtual_memory().percent
            gpu_available = torch.cuda.is_available()
            gpu_memory = GPUtil.getGPUs()[0].memoryUsed if gpu_available else 0
            
            # Filter models by task type
            if task_type == "speech_recognition":
                candidates = ["gcp_speech", "whisper"]
            else:  # tts
                candidates = ["gcp_tts", "speecht5"]
                
            # Score each model
            scores = {}
            for model in candidates:
                metrics = self.metrics[model]
                
                # Calculate score based on metrics and system state
                score = (
                    metrics.accuracy * 0.4 +
                    (1 - metrics.latency) * 0.2 +
                    (1 - metrics.resource_usage) * 0.2 +
                    metrics.availability * 0.2
                )
                
                # Adjust for system resources
                if "gcp" in model:
                    score *= (1 - (cpu_percent + memory_percent) / 200)
                else:
                    if gpu_available and gpu_memory < 80:
                        score *= 1.2
                    else:
                        score *= 0.8
                        
                scores[model] = score
                
            # Select best model
            best_model = max(scores.items(), key=lambda x: x[1])[0]
            
            # Log selection
            self.model_history.append({
                'timestamp': time.time(),
                'task_type': task_type,
                'selected_model': best_model,
                'scores': scores,
                'system_state': {
                    'cpu': cpu_percent,
                    'memory': memory_percent,
                    'gpu_available': gpu_available,
                    'gpu_memory': gpu_memory
                }
            })
            
            return best_model
            
        except Exception as e:
            logger.error(f"Model selection failed: {e}")
            return "gcp_speech" if task_type == "speech_recognition" else "gcp_tts"

class VoiceActivityDetector:
    def __init__(self, threshold: float = 0.1, min_duration: float = 0.5):
        self.threshold = threshold
        self.min_duration = min_duration
        self.is_speaking = False
        self.speech_start = 0
        
    def detect(self, audio_data: np.ndarray) -> bool:
        """Detect voice activity in audio data."""
        try:
            # Calculate audio level
            level = np.abs(audio_data).mean()
            
            # Update state
            if level > self.threshold:
                if not self.is_speaking:
                    self.is_speaking = True
                    self.speech_start = time.time()
                return True
            elif self.is_speaking:
                if time.time() - self.speech_start < self.min_duration:
                    return True
                self.is_speaking = False
                
            return False
            
        except Exception as e:
            logger.error(f"Voice activity detection failed: {e}")
            return False

class VoiceChat:
    def __init__(self, google_ai: Optional[GoogleAIIntegration] = None):
        """Initialize voice chat with automated model selection."""
        self.google_ai = google_ai or GoogleAIIntegration()
        self.audio_queue = queue.Queue()
        self.is_listening = False
        self.is_speaking = False
        self.callback = None
        self.model_selector = ModelSelector()
        self.vad = VoiceActivityDetector()
        self._setup_audio()
        self._setup_models()
        
    def _setup_audio(self):
        """Setup audio input/output."""
        try:
            self.audio = pyaudio.PyAudio()
            self.stream = self.audio.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=16000,
                input=True,
                frames_per_buffer=1024
            )
            logger.info("Successfully initialized audio")
        except Exception as e:
            logger.error(f"Failed to initialize audio: {e}")
            raise
            
    def _setup_models(self):
        """Setup all available models."""
        try:
            # Setup GCP clients
            self.speech_client = speech.SpeechClient()
            self.tts_client = texttospeech.TextToSpeechClient()
            
            # Setup Hugging Face models
            self.whisper_model = AutoModelForSpeechSeq2Seq.from_pretrained(
                "openai/whisper-large-v3",
                torch_dtype=torch.float16,
                low_cpu_mem_usage=True,
                use_safetensors=True
            )
            self.whisper_processor = AutoProcessor.from_pretrained("openai/whisper-large-v3")
            
            self.speech_recognizer = pipeline(
                "automatic-speech-recognition",
                model=self.whisper_model,
                processor=self.whisper_processor,
                device="cuda" if torch.cuda.is_available() else "cpu"
            )
            
            self.tts_model = pipeline(
                "text-to-speech",
                model="microsoft/speecht5_tts",
                device="cuda" if torch.cuda.is_available() else "cpu"
            )
            
            logger.info("Successfully initialized all models")
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            raise
            
    def start_listening(self, callback: Callable[[str], None]):
        """Start listening for voice input with automated model selection."""
        self.callback = callback
        self.is_listening = True
        threading.Thread(target=self._listen_loop, daemon=True).start()
        
    def stop_listening(self):
        """Stop listening for voice input."""
        self.is_listening = False
        
    def _listen_loop(self):
        """Main listening loop with voice activity detection."""
        while self.is_listening:
            try:
                # Read audio data
                audio_data = np.frombuffer(
                    self.stream.read(1024),
                    dtype=np.int16
                )
                
                # Check for voice activity
                if not self.vad.detect(audio_data):
                    continue
                    
                # Select best model
                model_name = self.model_selector.select_model("speech_recognition")
                
                try:
                    start_time = time.time()
                    
                    if model_name == "gcp_speech":
                        # Use GCP Speech-to-Text
                        recognition_audio = speech.RecognitionAudio(content=audio_data.tobytes())
                        response = self.speech_client.recognize(
                            config=self.recognition_config,
                            audio=recognition_audio
                        )
                        text = response.results[0].alternatives[0].transcript
                    else:
                        # Use Hugging Face Whisper
                        result = self.speech_recognizer(
                            audio_data,
                            sampling_rate=16000,
                            return_timestamps=True
                        )
                        text = result["text"]
                        
                    # Update metrics
                    latency = time.time() - start_time
                    self.model_selector.update_metrics(model_name, {
                        'latency': latency,
                        'accuracy': 1.0 if text else 0.0
                    })
                    
                    if text and self.callback:
                        self.callback(text)
                        
                except Exception as e:
                    logger.error(f"Recognition failed: {e}")
                    
            except Exception as e:
                logger.error(f"Error in listen loop: {e}")
                time.sleep(1)
                
    def speak(self, text: str):
        """Convert text to speech with automated model selection."""
        try:
            self.is_speaking = True
            
            # Select best model
            model_name = self.model_selector.select_model("tts")
            
            start_time = time.time()
            
            if model_name == "gcp_tts":
                # Use GCP Text-to-Speech
                synthesis_input = texttospeech.SynthesisInput(text=text)
                voice = texttospeech.VoiceSelectionParams(
                    language_code="en-US",
                    name="en-US-Neural2-F",
                    ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
                )
                audio_config = texttospeech.AudioConfig(
                    audio_encoding=texttospeech.AudioEncoding.MP3,
                    speaking_rate=1.0,
                    pitch=0.0
                )
                response = self.tts_client.synthesize_speech(
                    input=synthesis_input,
                    voice=voice,
                    audio_config=audio_config
                )
                audio_content = response.audio_content
            else:
                # Use Hugging Face TTS
                speech = self.tts_model(text)
                audio_content = speech["audio"]
                
            # Update metrics
            latency = time.time() - start_time
            self.model_selector.update_metrics(model_name, {
                'latency': latency,
                'accuracy': 1.0
            })
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                temp_file.write(audio_content)
                temp_file.flush()
                
                # Play audio
                self._play_audio(temp_file.name)
                
            self.is_speaking = False
            
        except Exception as e:
            logger.error(f"Failed to speak: {e}")
            self.is_speaking = False
            
    def _play_audio(self, file_path: str):
        """Play audio file."""
        try:
            wf = wave.open(file_path, 'rb')
            
            # Open stream
            stream = self.audio.open(
                format=self.audio.get_format_from_width(wf.getsampwidth()),
                channels=wf.getnchannels(),
                rate=wf.getframerate(),
                output=True
            )
            
            # Read data
            data = wf.readframes(1024)
            while data:
                stream.write(data)
                data = wf.readframes(1024)
                
            # Cleanup
            stream.stop_stream()
            stream.close()
            wf.close()
            
            # Remove temporary file
            os.unlink(file_path)
            
        except Exception as e:
            logger.error(f"Failed to play audio: {e}")
            
    def get_status(self) -> Dict[str, Any]:
        """Get comprehensive status including model metrics."""
        return {
            'is_listening': self.is_listening,
            'is_speaking': self.is_speaking,
            'model_metrics': {
                name: {
                    'latency': metrics.latency,
                    'accuracy': metrics.accuracy,
                    'resource_usage': metrics.resource_usage,
                    'availability': metrics.availability,
                    'last_used': metrics.last_used
                }
                for name, metrics in self.model_selector.metrics.items()
            },
            'model_history': self.model_selector.model_history[-10:],  # Last 10 selections
            'voice_activity': {
                'is_speaking': self.vad.is_speaking,
                'threshold': self.vad.threshold,
                'min_duration': self.vad.min_duration
            }
        }
            
    def cleanup(self):
        """Cleanup resources."""
        try:
            self.stop_listening()
            self.stream.stop_stream()
            self.stream.close()
            self.audio.terminate()
            
            # Clear CUDA cache if using GPU
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                
        except Exception as e:
            logger.error(f"Failed to cleanup: {e}")

def initialize_voice_chat(google_ai: Optional[GoogleAIIntegration] = None) -> Optional[VoiceChat]:
    """Initialize voice chat with error handling."""
    try:
        return VoiceChat(google_ai)
    except Exception as e:
        logger.error(f"Failed to initialize voice chat: {e}")
        return None 
