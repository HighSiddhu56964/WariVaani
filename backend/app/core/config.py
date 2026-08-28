from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "WariVaani Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "warivaani"
    POSTGRES_HOST: str = "127.0.0.1"
    POSTGRES_PORT: int = 5432

    # Demo Mode & Security Settings
    DEMO_MODE: bool = True
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"]

    # Speech-to-Text & Text-to-Speech configuration
    STT_PROVIDER: str = "sarvam"          # Options: sarvam, faster_whisper, mock
    TTS_PROVIDER: str = "sarvam"          # Options: sarvam, gtts, mock
    STT_LANGUAGE: str = "mr-IN"
    TTS_LANGUAGE: str = "mr-IN"

    # Sarvam AI STT Settings
    SARVAM_STT_MODEL: str = "saaras:v3"
    SARVAM_STT_LANGUAGE: str = "mr-IN"

    # Faster Whisper Offline Fallback Settings
    WHISPER_MODEL: str = "small"
    WHISPER_DEVICE: str = "cpu"
    WHISPER_COMPUTE_TYPE: str = "int8"

    # Sarvam AI Bulbul v3 TTS Settings
    SARVAM_API_KEY: Optional[str] = None
    SARVAM_TTS_MODEL: str = "bulbul:v3"
    SARVAM_TTS_LANGUAGE: str = "mr-IN"
    SARVAM_TTS_SPEAKER: str = "shubh"
    SARVAM_TTS_SAMPLE_RATE: int = 16000

    STT_API_KEY: Optional[str] = None
    TTS_API_KEY: Optional[str] = None
    HF_TOKEN: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def sync_database_url(self) -> str:
        return self.DATABASE_URL


settings = Settings()
