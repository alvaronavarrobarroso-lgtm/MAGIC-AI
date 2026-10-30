
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from google import genai

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("No se encontró GEMINI_API_KEY en .env")

client = genai.Client(api_key=api_key)

app = FastAPI()

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "frontend"),
    name="static"
)


class ChatRequest(BaseModel):
    message: str
    history: list = []


@app.get("/")
def home():
    return FileResponse(BASE_DIR / "frontend" / "index.html")


@app.post("/api/chat")
def chat(request: ChatRequest):
    try:
        contents = []

        for item in request.history:
            role = item.get("role")
            content = item.get("content")

            if role in ("user", "assistant") and content:
                contents.append({
                    "role": "user" if role == "user" else "model",
                    "parts": [{"text": content}]
                })

        contents.append({
            "role": "user",
            "parts": [{"text": request.message}]
        })

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=contents
        )

        return {"reply": response.text}

    except Exception as e:
        print("Error de Gemini:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

app.mount(
    "/",
    StaticFiles(directory="frontend", html=True),
    name="frontend"
)