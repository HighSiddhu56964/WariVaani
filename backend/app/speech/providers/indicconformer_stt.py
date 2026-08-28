"""Marathi speech-to-text providers used by the local voice pipeline."""

from __future__ import annotations

import io
import os
import tempfile
import wave
from threading import Lock

import numpy as np


INDICCONFORMER_MODEL = "ai4bharat/indicconformer_stt_mr_hybrid_ctc_rnnt_large"
WHISPER_MODEL = "openai/whisper-small"


def _text_from_nemo_result(result) -> str:
    """Handle the string and Hypothesis return formats used by NeMo releases."""
    first = result[0] if result else ""
    return str(first.text if hasattr(first, "text") else first).strip()


class IndicConformerSTT:
    """CPU singleton for AI4Bharat's Marathi hybrid CTC/RNNT model."""

    _instance = None
    _instance_lock = Lock()
    _init_lock = Lock()

    def __new__(cls, *args, **kwargs):
        with cls._instance_lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, token: str | None = None):
        with self._init_lock:
            if getattr(self, "_initialized", False):
                return
            self.device = "cpu"
            self.model = None
            self._load_model(token)
            self._initialized = True

    def _load_model(self, token: str | None) -> None:
        # NeMo/Hugging Face read this themselves. Avoid login(), which writes
        # credentials into the user's global Hugging Face configuration.
        if token and not os.environ.get("HF_TOKEN"):
            os.environ["HF_TOKEN"] = token.strip()

        try:
            import torch
            import nemo.collections.asr as nemo_asr

            model = nemo_asr.models.ASRModel.from_pretrained(INDICCONFORMER_MODEL)
            model.freeze()
            model.eval()
            model = model.to(torch.device("cpu"))
            model.cur_decoder = "ctc"
            self.model = model
        except Exception as exc:
            message = (
                "AI4Bharat IndicConformer Marathi failed to load. "
                f"Exact error: {type(exc).__name__}: {exc}. "
                "Install the AI4Bharat NeMo nemo-v2 fork and accept the gated "
                f"model at https://huggingface.co/{INDICCONFORMER_MODEL}. "
                "Whisper is not being selected automatically."
            )
            print(f"[STT ERROR] {message}")
            raise RuntimeError(message) from exc

        print("STT: AI4Bharat IndicConformer Marathi")
        print(f"Model: {INDICCONFORMER_MODEL}")
        print("Decoder: CTC")
        print("Device: CPU")

    def transcribe(self, audio_bytes: bytes, language: str = "mr") -> str:
        if not audio_bytes:
            return ""
        if self.model is None:
            raise RuntimeError("AI4Bharat IndicConformer is not initialized.")

        audio, sample_rate = self._read_wav(audio_bytes)
        if sample_rate != 16000:
            audio = self._resample(audio, sample_rate, 16000)

        path = ""
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as handle:
                path = handle.name
            self._write_mono_wav(path, audio, 16000)
            result = self.model.transcribe(
                [path], batch_size=1, logprobs=False, language_id="mr"
            )
            return _text_from_nemo_result(result)
        finally:
            if path and os.path.exists(path):
                os.remove(path)

    @staticmethod
    def _read_wav(wav_bytes: bytes) -> tuple[np.ndarray, int]:
        with wave.open(io.BytesIO(wav_bytes), "rb") as source:
            channels = source.getnchannels()
            sample_rate = source.getframerate()
            width = source.getsampwidth()
            frames = source.readframes(source.getnframes())

        if width == 2:
            audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
        elif width == 4:
            audio = np.frombuffer(frames, dtype=np.int32).astype(np.float32) / 2147483648.0
        elif width == 1:
            audio = np.frombuffer(frames, dtype=np.uint8).astype(np.float32) / 128.0 - 1.0
        else:
            raise ValueError(f"Unsupported WAV sample width: {width} bytes")

        if channels > 1:
            audio = audio.reshape(-1, channels).mean(axis=1)
        return audio, sample_rate

    @staticmethod
    def _resample(audio: np.ndarray, source_rate: int, target_rate: int) -> np.ndarray:
        if source_rate <= 0:
            raise ValueError("WAV sample rate must be positive")
        output_length = round(len(audio) * target_rate / source_rate)
        if not len(audio) or output_length <= 0:
            return np.array([], dtype=np.float32)
        return np.interp(
            np.linspace(0, len(audio), output_length, endpoint=False),
            np.arange(len(audio)),
            audio,
        ).astype(np.float32)

    @staticmethod
    def _write_mono_wav(path: str, audio: np.ndarray, sample_rate: int) -> None:
        pcm = (np.clip(audio, -1.0, 1.0) * 32767).astype(np.int16)
        with wave.open(path, "wb") as target:
            target.setnchannels(1)
            target.setsampwidth(2)
            target.setframerate(sample_rate)
            target.writeframes(pcm.tobytes())


class WhisperSTT:
    """Explicit fallback; instantiated only when ``STT_PROVIDER=whisper``."""

    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
        from transformers import pipeline

        self.pipe = pipeline(
            "automatic-speech-recognition",
            model=WHISPER_MODEL,
            generate_kwargs={"language": "marathi"},
            device=-1,
        )
        self._initialized = True
        print(f"STT: OpenAI Whisper fallback ({WHISPER_MODEL})")
        print("Device: CPU")

    def transcribe(self, audio_bytes: bytes, language: str = "mr") -> str:
        if not audio_bytes:
            return ""
        audio, sample_rate = IndicConformerSTT._read_wav(audio_bytes)
        if sample_rate != 16000:
            audio = IndicConformerSTT._resample(audio, sample_rate, 16000)
        result = self.pipe({"raw": audio, "sampling_rate": 16000})
        return result.get("text", "").strip() if isinstance(result, dict) else str(result).strip()
