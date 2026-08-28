from abc import ABC, abstractmethod
from typing import Optional
from app.core.config import settings
from app.speech.providers.sarvam_tts import SarvamTTS
from app.speech.providers.gtts_tts import gTTSTTS
from app.speech.providers.mock_tts import MockTTS


class BaseTTS(ABC):
    """Abstract Base Class for Text-To-Speech Providers."""

    @abstractmethod
    def synthesize(self, text: str, language: str = "mr-IN") -> bytes:
        """Convert Marathi text string into audio bytes."""
        pass


def get_tts_provider():
    """
    Factory function returning configured TTS Provider instance.
    Defaults strictly to Sarvam AI Bulbul v3 for low latency.
    """
    provider = (settings.TTS_PROVIDER or "sarvam").lower()

    if provider in ["sarvam", "bulbul", "sarvamai"]:
        return SarvamTTS()
    elif provider == "gtts":
        print("⚠️ [TTS Warning]: Running with optional gTTS cloud provider.")
        return gTTSTTS()
    elif provider in ["indic_parler", "indicparler"]:
        # Optional local Indic Parler loaded ONLY if explicitly requested
        from app.speech.providers.indic_parler_tts import IndicParlerTTS
        return IndicParlerTTS()
    elif provider == "mock":
        return MockTTS()
    else:
        raise ValueError(
            f"Unknown TTS provider '{provider}'. Supported options: 'sarvam', 'gtts', 'indic_parler', 'mock'."
        )
