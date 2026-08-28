"""Unit tests for the IndicConformer adapter; no model download required."""

import io
import wave
from unittest.mock import MagicMock, patch

import numpy as np

from app.speech.providers.indicconformer_stt import IndicConformerSTT


def _stereo_8khz_wav() -> bytes:
    stream = io.BytesIO()
    samples = np.zeros((800, 2), dtype=np.int16)
    with wave.open(stream, "wb") as target:
        target.setnchannels(2)
        target.setsampwidth(2)
        target.setframerate(8000)
        target.writeframes(samples.tobytes())
    return stream.getvalue()


def test_model_is_initialized_only_once():
    IndicConformerSTT._instance = None
    with patch.object(IndicConformerSTT, "_load_model") as load:
        first = IndicConformerSTT("token")
        second = IndicConformerSTT("token")
    assert first is second
    load.assert_called_once_with("token")
    IndicConformerSTT._instance = None


def test_transcribe_uses_marathi_ctc_contract_and_mono_16khz():
    provider = object.__new__(IndicConformerSTT)
    provider.model = MagicMock()
    provider.model.transcribe.return_value = ["पालखी कुठे आहे"]

    def inspect_wav(paths, **kwargs):
        with wave.open(paths[0], "rb") as source:
            assert source.getnchannels() == 1
            assert source.getframerate() == 16000
        assert kwargs == {"batch_size": 1, "logprobs": False, "language_id": "mr"}
        return ["पालखी कुठे आहे"]

    provider.model.transcribe.side_effect = inspect_wav
    assert provider.transcribe(_stereo_8khz_wav()) == "पालखी कुठे आहे"
