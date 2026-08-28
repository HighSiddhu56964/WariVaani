import base64
import json
import time
import requests
from typing import Optional, Tuple
from app.core.config import settings


class SarvamTTS:
    """
    Sarvam AI Bulbul v3 Text-to-Speech Provider.
    Target Model: bulbul:v3
    Target Language: mr-IN (Marathi)
    Target Speaker: shubh
    Target Sample Rate: 16000 Hz
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        language: Optional[str] = None,
        speaker: Optional[str] = None,
        sample_rate: Optional[int] = None
    ):
        self.api_key = api_key or settings.SARVAM_API_KEY
        self.model = model or settings.SARVAM_TTS_MODEL or "bulbul:v3"
        self.language = language or settings.SARVAM_TTS_LANGUAGE or "mr-IN"
        self.speaker = speaker or settings.SARVAM_TTS_SPEAKER or "shubh"
        self.sample_rate = sample_rate or settings.SARVAM_TTS_SAMPLE_RATE or 16000
        self.api_url = "https://api.sarvam.ai/text-to-speech"

        if not self.api_key or not self.api_key.strip():
            print("⚠️ [Sarvam TTS Warning]: SARVAM_API_KEY is not configured in .env.")

    def synthesize(self, text: str, language: Optional[str] = None) -> bytes:
        """Synthesize text using Sarvam Bulbul v3 REST API."""
        audio_bytes, _ = self.synthesize_with_timing(text, language)
        return audio_bytes

    def synthesize_with_timing(
        self,
        text: str,
        language: Optional[str] = None
    ) -> Tuple[bytes, float]:
        """Synthesize text and return (audio_bytes, tts_first_audio_latency_seconds)."""
        if not self.api_key or not self.api_key.strip():
            error_msg = (
                "❌ [Sarvam TTS Failure]: SARVAM_API_KEY is missing in your .env file.\n"
                "   💡 Fix: Open warivaani/.env and set: SARVAM_API_KEY=your_sarvam_key"
            )
            print(error_msg)
            raise RuntimeError(error_msg)

        if not text or not text.strip():
            return b"", 0.0

        target_lang = language or self.language
        headers = {
            "Content-Type": "application/json",
            "api-subscription-key": self.api_key.strip()
        }

        # Bulbul V3 model payload parameters: pitch and loudness are NOT supported in v3.
        payload = {
            "inputs": [text.strip()],
            "target_language_code": target_lang,
            "speaker": self.speaker,
            "pace": 1.0,
            "speech_sample_rate": self.sample_rate,
            "enable_preprocessing": True,
            "model": self.model
        }

        start_time = time.time()
        try:
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=10)
            latency = time.time() - start_time

            if response.status_code == 200:
                data = response.json()
                audios = data.get("audios", [])
                if audios and len(audios) > 0:
                    base64_audio = audios[0]
                    audio_bytes = base64.b64decode(base64_audio)
                    return audio_bytes, latency
                else:
                    print("⚠️ [Sarvam TTS]: Response received but 'audios' payload was empty.")
                    return b"", latency

            elif response.status_code == 403:
                error_detail = response.text
                error_msg = f"❌ [Sarvam TTS Error 403 Forbidden]: {error_detail}"
                print(error_msg)
                raise RuntimeError(error_msg)

            elif response.status_code == 429:
                error_detail = response.text
                error_msg = f"❌ [Sarvam TTS Error 429 Rate Limit]: {error_detail}"
                print(error_msg)
                raise RuntimeError(error_msg)

            else:
                error_msg = f"❌ [Sarvam TTS Error {response.status_code}]: {response.text}"
                print(error_msg)
                raise RuntimeError(error_msg)

        except requests.exceptions.RequestException as e:
            error_msg = f"❌ [Sarvam TTS Network Request Error]: {e}"
            print(error_msg)
            raise RuntimeError(error_msg) from e
