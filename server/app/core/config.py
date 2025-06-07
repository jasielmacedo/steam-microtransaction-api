import os
from typing import List, Union, Optional
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    # Base settings
    API_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Steam Microtransaction API"
    PROJECT_DESCRIPTION: str = "An API to handle Steam microtransactions using Steam web services."
    VERSION: str = "3.0.0"
    
    # Environment
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]
    
    # Use model_config instead of field_validator for CORS_ORIGINS
    model_config = {
        "env_prefix": "",
        "arbitrary_types_allowed": True,
        "extra": "ignore",
    }
    
    # Authentication
    SECRET_KEY: str = os.getenv("JWT_SECRET", "microtrax-jwt-secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # MongoDB settings
    MONGODB_URL: str = os.getenv("MONGODB_URI", "mongodb://admin:password@mongodb:27017/microtrax?authSource=admin")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "microtrax")
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "./microtrax.db")
    
    # Admin user
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@example.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "adminPassword123")
    ADMIN_NAME: str = os.getenv("ADMIN_NAME", "Admin User")
    
    # Steam API
    STEAM_API_KEY: str = os.getenv("STEAM_API_KEY", "")
    STEAM_PUBLISHER_KEY: str = os.getenv("STEAM_PUBLISHER_KEY", "")
    STEAM_APP_ID: str = os.getenv("STEAM_APP_ID", "")
    
    # Notification settings
    # Email notification settings
    EMAIL_NOTIFICATIONS_ENABLED: bool = os.getenv("EMAIL_NOTIFICATIONS_ENABLED", "False").lower() in ("true", "1", "t")
    EMAIL_SMTP_HOST: str = os.getenv("EMAIL_SMTP_HOST", "")
    EMAIL_SMTP_PORT: int = int(os.getenv("EMAIL_SMTP_PORT", "587"))
    EMAIL_SMTP_USER: str = os.getenv("EMAIL_SMTP_USER", "")
    EMAIL_SMTP_PASSWORD: str = os.getenv("EMAIL_SMTP_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@microtrax.example.com")
    EMAIL_USE_TLS: bool = os.getenv("EMAIL_USE_TLS", "True").lower() in ("true", "1", "t")
    
    # Push notification settings
    PUSH_NOTIFICATIONS_ENABLED: bool = os.getenv("PUSH_NOTIFICATIONS_ENABLED", "False").lower() in ("true", "1", "t")
    FCM_API_KEY: str = os.getenv("FCM_API_KEY", "")
    
    # Web notification settings
    WEB_NOTIFICATIONS_ENABLED: bool = os.getenv("WEB_NOTIFICATIONS_ENABLED", "False").lower() in ("true", "1", "t")
    VAPID_PUBLIC_KEY: str = os.getenv("VAPID_PUBLIC_KEY", "")
    VAPID_PRIVATE_KEY: str = os.getenv("VAPID_PRIVATE_KEY", "")
    
    # Rate limiting
    RATE_LIMIT_STANDARD: int = 100  # requests per 15 minutes
    RATE_LIMIT_STRICT: int = 30  # requests per 15 minutes for sensitive operations


settings = Settings()