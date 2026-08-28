from abc import ABC, abstractmethod
from app.core.config import settings


class BaseSTT(ABC):
    """Abstract Base Class for Speech-To-Text Providers."""

    @abstractmethod
    def transcribe(self, audio_bytes: bytes, language: str = "mr") -> str:
        """Convert WAV/PCM audio bytes into Marathi text string."""
        pass


def get_stt_provider():
    """
    Factory function returning configured STT Provider instance.

    STT_PROVIDER=sarvam         → Sarvam AI Saaras v3 (DEFAULT)
    STT_PROVIDER=faster_whisper → faster-whisper via CTranslate2 (offline fallback)
    STT_PROVIDER=mock            → silent mock (testing only)
    """
    provider = (settings.STT_PROVIDER or "sarvam").lower()

    if provider in ["sarvam", "saaras", "sarvam_stt"]:
        from app.speech.providers.sarvam_stt import SarvamSTT
        return SarvamSTT()

    elif provider in ["faster_whisper", "faster-whisper", "whisper"]:
        from app.speech.providers.faster_whisper_stt import FasterWhisperSTT
        return FasterWhisperSTT()

    elif provider in ["indicconformer", "indic_conformer"]:
        from app.speech.providers.indicconformer_stt import IndicConformerSTT
        return IndicConformerSTT(token=settings.HF_TOKEN)

    elif provider == "mock":
        from app.speech.providers.mock_stt import MockSTT
        return MockSTT()

    else:
        # Default to Sarvam Saaras v3 STT
        from app.speech.providers.sarvam_stt import SarvamSTT
        return SarvamSTT()
