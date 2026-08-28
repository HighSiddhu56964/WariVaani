"""
WariVaani - Faster Whisper STT Provider (faster_whisper_stt.py)

Local Speech-to-Text provider using open-source `faster-whisper`.
Optimized for CPU inference with INT8 quantization for Marathi voice queries.
"""

import os
import sys
import tempfile
import time
from faster_whisper import WhisperModel
from app.speech.stt import BaseSTT
from app.core.config import settings

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


class FasterWhisperSTT(BaseSTT):
    """
    Faster-Whisper STT implementation.
    Loads the WhisperModel ONCE at startup and reuses it across transcribe calls.
    """

    def __init__(
        self,
        model_size: str = None,
        device: str = None,
        compute_type: str = None,
        language: str = None,
    ):
        self.model_size = model_size or getattr(settings, "WHISPER_MODEL", "small")
        self.device = device or getattr(settings, "WHISPER_DEVICE", "cpu")
        self.compute_type = compute_type or getattr(settings, "WHISPER_COMPUTE_TYPE", "int8")
        self.language = language or getattr(settings, "STT_LANGUAGE", "mr")

        print(f"🔄 Loading faster-whisper STT...")
        print(f"   Model   : {self.model_size}")
        print(f"   Language: Marathi ({self.language})")
        print(f"   Device  : {self.device.upper()}")
        print(f"   Compute : {self.compute_type.upper()}")

        t0 = time.time()
        self.model = WhisperModel(
            self.model_size,
            device=self.device.lower(),
            compute_type=self.compute_type.lower(),
        )
        load_time = time.time() - t0
        print(f"[OK] faster-whisper ({self.model_size}) STT loaded on [{self.device.upper()}] in {load_time:.2f}s.")

    def transcribe(self, audio_bytes: bytes, language: str = "mr") -> str:
        """
        Transcribe audio bytes (WAV/PCM) to text using faster-whisper.
        """
        if not audio_bytes:
            return ""

        lang = language or self.language

        # Write audio bytes to a temporary WAV file for faster-whisper processing
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            segments, info = self.model.transcribe(
                tmp_path,
                language=lang,
                beam_size=3,
                vad_filter=True,
                condition_on_previous_text=False,
            )

            # Join transcribed segments
            text_segments = [segment.text.strip() for segment in segments if segment.text]
            full_text = " ".join(text_segments).strip()
            return full_text
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
