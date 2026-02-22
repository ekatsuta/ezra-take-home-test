from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    environment: str = "development"
    debug: bool = True

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # Database
    database_url: str = "sqlite:///./app.db"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
