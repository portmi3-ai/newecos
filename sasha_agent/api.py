from fastapi import FastAPI, Request
from pydantic import BaseModel
import yaml
import logging
from gcp_client import GCPClient
from huggingface_client import HuggingFaceClient

# Load config
with open('sasha_agent/config.yaml', 'r') as f:
    config = yaml.safe_load(f)

gcp = GCPClient(config['gcp'])
hf = HuggingFaceClient(config['huggingface']['api_key'])

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

@app.post('/chat')
async def chat_endpoint(req: ChatRequest):
    user_message = req.message
    # Use Hugging Face for AI response
    ai_response = hf.generate_response(user_message)
    if not ai_response or ai_response.startswith('[HuggingFace'):
        ai_response = f"Sasha received: {user_message}"
    return {"response": ai_response} 