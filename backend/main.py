
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
    raise RuntimeError("No se encontró GEMINI_API_KEY")

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

        # Utilizamos solo los últimos 6 mensajes
        for item in request.history[-6:]:
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
            contents=contents,
            config={
                "max_output_tokens": 400
            }
        )

        return {"reply": response.text}

    except Exception as e:
        error = str(e)
        print("Error de Gemini:", error)

        # Mensaje especial cuando se agota la cuota
        if "429" in error or "RESOURCE_EXHAUSTED" in error:
            return {
                "reply": "✨ ¡Has utilizado todos los mensajes gratuitos de MAGIC AI por hoy! Vuelve mañana y seguiremos creando magia juntos. 💜"
            }

        raise HTTPException(
            status_code=500,
            detail="Ha ocurrido un problema. Inténtalo de nuevo."
        )


app.mount(
    "/",
    StaticFiles(directory=str(BASE_DIR / "frontend"), html=True),
    name="frontend"
)
