from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
import os

class Settings(BaseSettings):
    # Environment settings
    DEBUG: bool = False
    
    # Database settings - use Railway's DATABASE_URL if available
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:myDB123@localhost/meal_plan_db2")
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "please-change-this-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # CORS settings - update with actual Railway domains
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://smartfuel-frontend.up.railway.app",  # Frontend Railway domain
        "https://smartfuel.up.railway.app"           # Main Railway domain
    ]

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings() 