"""
WariVaani - Sarvam AI Saaras v3 STT Provider (sarvam_stt.py)

Speech-to-Text provider using Sarvam AI's Saaras v3 model for high-accuracy Marathi transcription.
"""

import io
import sys
import requests
from typing import Optional
from sarvamai import SarvamAI
from app.speech.stt import BaseSTT
from app.core.config import settings

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


class SarvamSTT(BaseSTT):
    """
    Sarvam AI Saaras v3 STT Implementation.
    Explicitly targets Marathi (mr-IN) audio with mode='transcribe'.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        language_code: Optional[str] = None,
    ):
        self.api_key = (
            api_key
            or getattr(settings, "SARVAM_API_KEY", None)
        )
        if not self.api_key:
            raise ValueError(
                "SARVAM_API_KEY environment variable is not set. "
                "Please configure SARVAM_API_KEY in your .env file."
            )

        self.model = model or getattr(settings, "SARVAM_STT_MODEL", "saaras:v3")
        self.language_code = (
            language_code or getattr(settings, "SARVAM_STT_LANGUAGE", "mr-IN")
        )
        self.mode = "transcribe"

        print(f"🔄 Loading Sarvam Saaras v3 STT...")
        print(f"   Model   : {self.model}")
        print(f"   Language: Marathi ({self.language_code})")

        # Initialize official SarvamAI SDK client
        self.client = SarvamAI(api_subscription_key=self.api_key)
        print("[OK] Sarvam Saaras v3 STT ready.")

    def transcribe(self, audio_bytes: bytes, language: str = "mr-IN") -> str:
        """
        Transcribe audio bytes (WAV, 16000Hz preferred) to Marathi text using Sarvam Saaras v3.
        """
        if not audio_bytes:
            return ""

        lang = language or self.language_code

        # Primary Path: Official SarvamAI SDK
        try:
            res = self.client.speech_to_text.transcribe(
                file=("input.wav", audio_bytes, "audio/wav"),
                model=self.model,
                language_code=lang,
                mode=self.mode,
            )
            transcript = getattr(res, "transcript", "") or ""
            return transcript.strip()
        except Exception as sdk_err:
            print(f"⚠️  [Sarvam STT SDK Warning]: {sdk_err}. Trying REST API fallback...")

        # Fallback Path: Direct Sarvam REST API HTTP request
        try:
            url = "https://api.sarvam.ai/speech-to-text"
            headers = {"api-subscription-key": self.api_key}
            files = {"file": ("input.wav", audio_bytes, "audio/wav")}
            data = {
                "model": self.model,
                "language_code": lang,
                "mode": self.mode,
            }

            resp = requests.post(url, headers=headers, files=files, data=data, timeout=15)
            if resp.status_code == 200:
                result = resp.json()
                return result.get("transcript", "").strip()
            else:
                print(f"❌ [Sarvam STT REST API Error] {resp.status_code}: {resp.text}")
                return ""
        except Exception as rest_err:
            print(f"❌ [Sarvam STT REST Exception]: {rest_err}")
            return ""
