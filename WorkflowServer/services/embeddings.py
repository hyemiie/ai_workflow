from openai import AsyncOpenAI
from core.config import settings
import httpx

_openai = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def embed_texts_openai(
    texts: list[str],
    model: str = "text-embedding-3-large",
) -> list[list[float]]:
    resp = await _openai.embeddings.create(input=texts, model=model)
    return [r.embedding for r in resp.data]


async def embed_texts_gemini(texts: list[str]) -> list[list[float]]:
    results = []
    async with httpx.AsyncClient() as client:
        for t in texts:
            resp = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
                params={"key": settings.GEMINI_API_KEY},
                json={
                    "model": "models/gemini-embedding-001",
                    "content": {"parts": [{"text": t}]},
                    "task_type": "RETRIEVAL_DOCUMENT"
                }
            )
            resp.raise_for_status()
            results.append(resp.json()["embedding"]["values"])
    return results


async def embed_texts(
    texts: list[str],
    model: str = "gemini-embedding",
) -> list[list[float]]:
    if model.startswith("text-embedding"):
        return await embed_texts_openai(texts, model)
    return await embed_texts_gemini(texts)