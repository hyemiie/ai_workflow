from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from core.db import init_db
from routers import stack, document, workflow, chat, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="GenAI Stack API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(stack.router)
app.include_router(document.router)
app.include_router(workflow.router)
app.include_router(chat.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/debug/models")
async def list_models():
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    models = [m.name for m in genai.list_models() if "generateContent" in m.supported_generation_methods]
    return {"models": models}