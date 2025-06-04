from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
import yaml
import logging
import uuid
import os
from ai_service import AIService
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import RequestValidationError
from fastapi.exceptions import RequestValidationError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the directory containing this file
current_dir = os.path.dirname(os.path.abspath(__file__))

# Load config
try:
    config_path = os.path.join(current_dir, 'config.yaml')
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    logger.info("Successfully loaded config.yaml")
except Exception as e:
    logger.error(f"Failed to load config.yaml: {str(e)}")
    config = {}

# Initialize AI service
try:
    ai_config_path = os.path.join(current_dir, 'ai_config.yaml')
    ai_service = AIService(ai_config_path)
    logger.info("Successfully initialized AI service")
except Exception as e:
    logger.error(f"Failed to initialize AI service: {str(e)}")
    raise

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:5173"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str = None
    mode: str = "default"

class ChatResponse(BaseModel):
    response: str
    session_id: str

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation error: {exc.errors()} | Body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": (await request.body()).decode()
        },
    )

@app.post('/chat')
async def chat_endpoint(req: ChatRequest):
    try:
        logger.info(f"Received chat request: {req}")
        logger.info(f"Received chat request: {req.message[:50]}...")
        
        # Generate or use session ID
        session_id = req.session_id or str(uuid.uuid4())
        logger.info(f"Using session ID: {session_id}")
        
        # Generate AI response
        response = await ai_service.generate_response(
            message=req.message,
            session_id=session_id,
            mode=req.mode
        )
        
        logger.info(f"Generated response: {response[:50]}...")
        
        return ChatResponse(
            response=response,
            session_id=session_id
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(e)}"
        )

@app.post('/clear-conversation')
async def clear_conversation(session_id: str):
    try:
        logger.info(f"Clearing conversation for session: {session_id}")
        ai_service.clear_conversation(session_id)
        return {"status": "success", "message": "Conversation cleared"}
    except Exception as e:
        logger.error(f"Error clearing conversation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear conversation: {str(e)}"
        )

@app.get('/health')
async def health_check():
    """Health check endpoint to verify the service is running."""
    return {"status": "healthy", "service": "sasha-ai"} 