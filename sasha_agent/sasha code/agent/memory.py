import os
from google.cloud import firestore
from sentence_transformers import SentenceTransformer

db = firestore.Client()
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def retrieve_memory(state):
    text = state.get("input", "")
    embedding = embedder.encode([text])[0]
    return {"embedding": embedding, "text": text}
