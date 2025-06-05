import logging
import time
from voice_chat import initialize_voice_chat
from google_ai_integration import GoogleAIIntegration

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handle_response(text: str):
    """Handle Sasha's response."""
    logger.info(f"Sasha: {text}")
    # Add a small delay to make the conversation feel more natural
    time.sleep(0.5)

def main():
    """Main test function."""
    try:
        # Initialize Google AI integration
        google_ai = GoogleAIIntegration()
        
        # Initialize voice chat
        voice_chat = initialize_voice_chat(google_ai)
        if not voice_chat:
            logger.error("Failed to initialize voice chat")
            return
            
        logger.info("Starting Sasha voice chat test...")
        logger.info("Press Ctrl+C to exit")
        
        # Start listening
        voice_chat.start_listening(callback=handle_response)
        
        # Keep the main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("\nStopping Sasha voice chat test...")
    except Exception as e:
        logger.error(f"Error during test: {e}")
    finally:
        if 'voice_chat' in locals():
            voice_chat.cleanup()
            
if __name__ == "__main__":
    main() 