import io
import wave
import numpy as np
from typing import Optional
from app.core.config import settings

MODEL_NAME = "ai4bharat/indic-parler-tts"


class IndicParlerTTS:
    """
    AI4Bharat Indic Parler-TTS Marathi Text-to-Speech Provider.
    Official HuggingFace Model: ai4bharat/indic-parler-tts
    Uses dual tokenizers (description_tokenizer + prompt_tokenizer) as per AI4Bharat specifications.
    """

    _instance = None
    _initialized = False

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(IndicParlerTTS, cls).__new__(cls)
        return cls._instance

    def __init__(self, token: Optional[str] = None):
        if self._initialized:
            return

        self.token = token or settings.HF_TOKEN
        self.device = "cuda" if self._check_cuda() else "cpu"
        self.model = None
        self.tokenizer = None
        self.description_tokenizer = None
        self._load_model()
        IndicParlerTTS._initialized = True

    def _check_cuda(self) -> bool:
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False

    def _load_model(self):
        print(f"🔄 Initializing AI4Bharat Indic Parler-TTS ({MODEL_NAME}) on [{self.device.upper()}]...")
        try:
            import torch
            from parler_tts import ParlerTTSForConditionalGeneration
            from transformers import AutoTokenizer

            kwargs = {}
            if self.token:
                kwargs["token"] = self.token

            self.model = ParlerTTSForConditionalGeneration.from_pretrained(
                MODEL_NAME,
                **kwargs
            ).to(self.device)

            self.tokenizer = AutoTokenizer.from_pretrained(
                MODEL_NAME,
                **kwargs
            )

            # Description tokenizer loads from text_encoder path as per AI4Bharat documentation
            self.description_tokenizer = AutoTokenizer.from_pretrained(
                self.model.config.text_encoder._name_or_path,
                **kwargs
            )

            print(f"✅ AI4Bharat Indic Parler-TTS initialized successfully on [{self.device.upper()}].")
        except Exception as e:
            error_msg = (
                f"❌ [Indic Parler-TTS Failure]: Unable to load local AI4Bharat model '{MODEL_NAME}'.\n"
                f"   Reason: {e}\n"
                f"   💡 How to fix:\n"
                f"   1. Accept model conditions at: https://huggingface.co/{MODEL_NAME}\n"
                f"   2. Ensure your Hugging Face token is set in .env (HF_TOKEN=your_token)"
            )
            print(error_msg)
            raise RuntimeError(error_msg) from e

    def synthesize(self, text: str, language: str = "mr") -> bytes:
        if not self.model or not self.tokenizer or not self.description_tokenizer:
            raise RuntimeError("Indic Parler-TTS model is not initialized.")

        if not text or not text.strip():
            return b""

        try:
            import torch

            prompt = text.strip()
            # Sunita is a recommended Marathi speaker on AI4Bharat model card
            description = "Sunita speaks with a clear Marathi voice in a close environment, with natural cadence and excellent audio quality."

            desc_inputs = self.description_tokenizer(description, return_tensors="pt").to(self.device)
            prompt_inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)

            generation = self.model.generate(
                input_ids=desc_inputs.input_ids,
                attention_mask=desc_inputs.attention_mask,
                prompt_input_ids=prompt_inputs.input_ids,
                prompt_attention_mask=prompt_inputs.attention_mask
            )

            audio_arr = generation.cpu().numpy().squeeze()
            sample_rate = self.model.config.sampling_rate

            wav_bytes = self._audio_array_to_wav(audio_arr, sample_rate)
            return wav_bytes
        except Exception as e:
            print(f"❌ [Indic Parler-TTS Synthesis Error]: {e}")
            raise e

    def _audio_array_to_wav(self, audio_arr: np.ndarray, sample_rate: int) -> bytes:
        """Convert float audio array (-1.0 to 1.0) into WAV bytes."""
        audio_int16 = (np.clip(audio_arr, -1.0, 1.0) * 32767).astype(np.int16)
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(audio_int16.tobytes())
        return wav_buffer.getvalue()
