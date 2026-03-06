from openai import AsyncOpenAI
from core.config import settings

_openai = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def call_openai(
    prompt: str,
    model: str = "gpt-4o-mini",
    temperature: float = 0.7,
    api_key: str = None,
) -> str:
    client = AsyncOpenAI(api_key=api_key or settings.OPENAI_API_KEY)
    resp = await client.chat.completions.create(
        model=model,
        temperature=temperature,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.choices[0].message.content


async def call_gemini(
    prompt: str,
    model: str = "gemini-pro",
    api_key: str = None,
) -> str:
    import google.generativeai as genai
    genai.configure(api_key=api_key or settings.GEMINI_API_KEY)

    model_map = {
        "gemini-pro":       "models/gemini-2.0-flash-lite",
        "gemini-flash":     "models/gemini-2.0-flash-lite",
        "gemini-1.5-pro":   "models/gemini-2.0-flash-lite",
        "gemini-1.5-flash": "models/gemini-2.0-flash-lite",
        "Gemini Pro":       "models/gemini-2.5-pro",
        "Gemini Flash":     "models/gemini-2.0-flash-lite",
    }
    api_model = model_map.get(model, "models/gemini-2.0-flash-lite")

    fallback_models = [
        api_model,
        "models/gemini-2.0-flash-lite",
        "models/gemini-flash-lite-latest",
        "models/gemma-3-4b-it",
    ]

    last_err = None
    for m_name in fallback_models:
        try:
            m = genai.GenerativeModel(m_name)
            resp = m.generate_content(prompt)
            return resp.text
        except Exception as e:
            last_err = e
            if "429" not in str(e):
                raise
            continue
    raise last_err


async def call_llm(
    prompt: str,
    model: str = "gpt-4o-mini",
    temperature: float = 0.7,
    api_key: str = None,
) -> str:
    
    if "gemini" in model.lower():
        return await call_gemini(prompt, model, api_key=api_key)
    return await call_openai(prompt, model, temperature, api_key=api_key)