from fastapi import FastAPI, Request
from agent.sasha_prompt import system_prompt
from agent.tts import speak
from agent.decision_graph import build_graph

app = FastAPI()
graph = build_graph()

@app.get("/")
def welcome():
    return {"message": "Sasha is live and ready to serve you, King."}

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message", "")
    result = graph.invoke({"input": message})
    voice_path = speak(message)
    return {"response": "Action processed.", "voice": voice_path}
