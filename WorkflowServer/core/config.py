from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str

    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    SERPAPI_KEY: str = ""
    BRAVE_API_KEY: str = ""

    # JWT
    JWT_SECRET: str = "changeme-use-a-strong-secret-in-production"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    SECRET_KEY: str = "changeme"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                import json
                return json.loads(v)
            return [origin.strip() for origin in v.split(",")]
        return v

    class Config:
        env_file = ".env"


settings = Settings()