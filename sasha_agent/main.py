import uvicorn
import logging
import os
from dotenv import load_dotenv
from api import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load environment variables
load_dotenv()

def check_environment():
    """Check if required environment variables are set."""
    required_vars = ['GOOGLE_API_KEY', 'HUGGINGFACE_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logging.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        logging.error("Please set these variables in your .env file or environment.")
        return False
    return True

if __name__ == '__main__':
    if check_environment():
        try:
            logging.info("Starting Sasha AI server...")
            port = int(os.getenv('PORT', 8000))
            uvicorn.run(
                app,
                host='0.0.0.0',
                port=port,
                log_level="info"
            )
        except Exception as e:
            logging.error(f"Failed to start server: {str(e)}")
    else:
        logging.error("Server startup aborted due to missing environment variables.") 