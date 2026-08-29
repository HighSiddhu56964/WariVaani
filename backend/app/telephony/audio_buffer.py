"""
WariVaani Telephony Audio Buffer & VAD Module
Handles Exotel signed-linear 16-bit PCM audio streams, sample rate conversion (resampling to 16kHz for STT and from 16kHz for TTS),
and strict state-machine VAD turn detection to prevent silence window false positives.
"""

import io
import sys
import wave
import base64
import math
import struct
from typing import Tuple, Optional

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    import webrtcvad
    WEBRTCVAD_AVAILABLE = True
except ImportError:
    WEBRTCVAD_AVAILABLE = False


def resample_pcm(pcm_bytes: bytes, in_rate: int, out_rate: int) -> bytes:
    """
    Resamples 16-bit signed linear PCM mono audio between sample rates.
    Uses Python's audioop module with scipy/numpy fallback.
    """
    if not pcm_bytes or in_rate == out_rate:
        return pcm_bytes

    # Primary: audioop (built-in standard library in Python 3.10)
    try:
        import audioop
        resampled, _ = audioop.ratecv(pcm_bytes, 2, 1, in_rate, out_rate, None)
        return resampled
    except Exception:
        pass

    # Fallback: scipy / numpy
    try:
        import numpy as np
        from scipy import signal
        samples = np.frombuffer(pcm_bytes, dtype=np.int16)
        num_output_samples = int(len(samples) * out_rate / in_rate)
        if num_output_samples <= 0:
            return b""
        resampled = signal.resample(samples, num_output_samples)
        return np.clip(resampled, -32768, 32767).astype(np.int16).tobytes()
    except Exception as e:
        print(f"⚠️ [Audio Resample Error]: {e}")
        return pcm_bytes


class AudioBuffer:
    """
    State machine audio buffer for Exotel telephony.
    Filters out background noise & silence windows, enforcing:
    - Minimum voiced duration (>= 250ms)
    - Audio energy RMS threshold (> 350)
    - Trailing silence threshold (700-1000ms)
    - Resampling to 16000 Hz for Sarvam Saaras STT
    """

    def __init__(self, sample_rate: int = 16000, silence_threshold_ms: int = 800):
        self.sample_rate = sample_rate
        self.bytes_per_sample = 2  # 16-bit PCM
        self.channels = 1
        self.silence_threshold_ms = silence_threshold_ms
        self.frame_duration_ms = 20  # 20ms frames for VAD
        self.frame_size = int(self.sample_rate * (self.frame_duration_ms / 1000.0) * self.bytes_per_sample)

        self.pcm_buffer = bytearray()
        self.unprocessed_pcm = bytearray()

        self.state = "IDLE"  # IDLE, LISTENING, PROCESSING, PLAYING
        self.silence_duration_ms = 0
        self.voiced_duration_ms = 0
        self.has_voiced_speech = False

        # Initialize WebRTC VAD if available and sample_rate is supported (8000, 16000, 32000, 48000)
        if WEBRTCVAD_AVAILABLE and self.sample_rate in (8000, 16000, 32000, 48000):
            try:
                self.vad = webrtcvad.Vad(mode=2)  # Mode 2: balanced aggressiveness
            except Exception as e:
                print(f"⚠️ [VAD Warning]: WebRTC VAD init failed ({e}), using RMS energy VAD.")
                self.vad = None
        else:
            self.vad = None

    def process_b64_chunk(self, b64_payload: str) -> Tuple[bool, bool, float]:
        """
        Process a base64-encoded PCM audio chunk from Exotel.
        Returns: (speech_detected, utterance_complete, voiced_audio_sec)
        """
        if not b64_payload:
            return False, False, 0.0

        try:
            pcm_bytes = base64.b64decode(b64_payload)
        except Exception as e:
            print(f"⚠️ [AudioBuffer]: Failed to decode base64 audio chunk: {e}")
            return False, False, 0.0

        return self.process_pcm_bytes(pcm_bytes)

    def process_pcm_bytes(self, pcm_bytes: bytes) -> Tuple[bool, bool, float]:
        """
        Process raw 16-bit PCM bytes at self.sample_rate.
        State machine: IDLE -> LISTENING -> PROCESSING
        Returns: (speech_detected_in_chunk, utterance_complete, total_audio_duration_sec)
        """
        if not pcm_bytes:
            return False, False, 0.0

        self.unprocessed_pcm.extend(pcm_bytes)
        utterance_complete = False
        speech_detected_in_chunk = False
        final_duration_sec = 0.0

        while len(self.unprocessed_pcm) >= self.frame_size:
            frame = bytes(self.unprocessed_pcm[:self.frame_size])
            del self.unprocessed_pcm[:self.frame_size]

            is_voiced = self._is_speech_frame(frame)

            if is_voiced:
                speech_detected_in_chunk = True
                if not self.has_voiced_speech:
                    self.has_voiced_speech = True
                    self.state = "LISTENING"
                    print("[CALLER] Speech started")

                self.voiced_duration_ms += self.frame_duration_ms
                self.silence_duration_ms = 0
                self.pcm_buffer.extend(frame)
            else:
                if self.has_voiced_speech:
                    # Speech was active, accumulate trailing silence to avoid clipping trailing syllables
                    self.pcm_buffer.extend(frame)
                    self.silence_duration_ms += self.frame_duration_ms

                    if self.silence_duration_ms >= self.silence_threshold_ms:
                        # Check if minimum voiced duration requirement (>= 250ms) is met
                        if self.voiced_duration_ms >= 250:
                            utterance_complete = True
                            self.state = "PROCESSING"
                            total_ms = self.voiced_duration_ms + self.silence_duration_ms
                            final_duration_sec = total_ms / 1000.0
                            print("[CALLER] Speech ended")
                            print(f"[CALLER] Audio duration: {final_duration_sec:.2f} sec")
                        else:
                            # Too short to be real speech (noise click / pop). Reset to IDLE silently!
                            self.clear()

        return speech_detected_in_chunk, utterance_complete, final_duration_sec

    def _is_speech_frame(self, frame: bytes) -> bool:
        """Evaluate if 20ms frame contains voice activity using RMS energy & WebRTC VAD."""
        rms = self._calc_rms(frame)
        if rms < 350:
            return False

        if self.vad and len(frame) == self.frame_size:
            try:
                return self.vad.is_speech(frame, self.sample_rate)
            except Exception:
                pass

        return rms > 450

    @staticmethod
    def _calc_rms(frame: bytes) -> float:
        """Calculate Root Mean Square (RMS) audio energy for 16-bit PCM."""
        count = len(frame) // 2
        if count == 0:
            return 0.0
        shorts = struct.unpack(f"<{count}h", frame)
        sum_squares = sum(s * s for s in shorts)
        return math.sqrt(sum_squares / count)

    def get_wav_bytes(self) -> bytes:
        """
        Resamples buffered PCM from self.sample_rate to 16000 Hz if necessary,
        and constructs a valid 16kHz 16-bit mono WAV byte array for Sarvam Saaras STT.
        """
        if not self.pcm_buffer:
            return b""

        raw_pcm = bytes(self.pcm_buffer)

        # Resample to 16kHz if Exotel sample rate is not 16000
        if self.sample_rate != 16000:
            pcm_16k = resample_pcm(raw_pcm, in_rate=self.sample_rate, out_rate=16000)
        else:
            pcm_16k = raw_pcm

        if not pcm_16k:
            return b""

        wav_io = io.BytesIO()
        with wave.open(wav_io, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(16000)
            wf.writeframes(pcm_16k)

        return wav_io.getvalue()

    def clear(self):
        """Reset audio buffer and VAD tracking state to IDLE."""
        self.pcm_buffer.clear()
        self.unprocessed_pcm.clear()
        self.state = "IDLE"
        self.silence_duration_ms = 0
        self.voiced_duration_ms = 0
        self.has_voiced_speech = False


def extract_pcm_from_tts(audio_bytes: bytes) -> bytes:
    """Extract raw signed linear PCM bytes from Sarvam TTS output (strips WAV header)."""
    if not audio_bytes:
        return b""

    if audio_bytes.startswith(b"RIFF") and len(audio_bytes) > 44:
        try:
            with wave.open(io.BytesIO(audio_bytes), "rb") as wf:
                return wf.readframes(wf.getnframes())
        except Exception:
            return audio_bytes[44:]

    return audio_bytes


def convert_tts_to_exotel_pcm(
    audio_bytes: bytes, target_sample_rate: int = 16000
) -> Tuple[bytes, dict]:
    """
    Decodes Sarvam TTS output (WAV container, base64 string, or raw PCM),
    normalizes to signed 16-bit little-endian mono PCM at target_sample_rate,
    and returns (raw_pcm_bytes, metadata_dict). Also saves debug WAV files.
    """
    if not audio_bytes:
        return b"", {
            "orig_format": "empty",
            "orig_rate": 0,
            "orig_channels": 0,
            "orig_bytes": 0,
        }

    # 1. Handle string/base64 encoded audio
    if isinstance(audio_bytes, str):
        try:
            audio_bytes = base64.b64decode(audio_bytes)
        except Exception:
            audio_bytes = audio_bytes.encode("utf-8")
    elif not audio_bytes.startswith(b"RIFF") and len(audio_bytes) > 100:
        try:
            decoded = base64.b64decode(audio_bytes)
            if decoded.startswith(b"RIFF"):
                audio_bytes = decoded
        except Exception:
            pass

    orig_bytes = len(audio_bytes)
    orig_format = "RAW PCM"
    orig_rate = target_sample_rate
    orig_channels = 1
    orig_sampwidth = 2
    raw_pcm = audio_bytes

    # Save original Sarvam response to debug_sarvam_original.wav
    try:
        with open("debug_sarvam_original.wav", "wb") as f:
            f.write(audio_bytes)
    except Exception:
        pass

    # 2. Inspect & extract PCM if WAV
    if audio_bytes.startswith(b"RIFF") and len(audio_bytes) > 44:
        try:
            with wave.open(io.BytesIO(audio_bytes), "rb") as wf:
                orig_channels = wf.getnchannels()
                orig_sampwidth = wf.getsampwidth()
                orig_rate = wf.getframerate()
                nframes = wf.getnframes()
                raw_pcm = wf.readframes(nframes)
                orig_format = f"WAV (S{orig_sampwidth*8}LE)"
        except Exception:
            orig_format = "WAV (header slice)"
            raw_pcm = audio_bytes[44:]

    # 3. Channel downmixing if stereo (or multi-channel)
    if orig_channels > 1 and orig_sampwidth == 2:
        try:
            import numpy as np

            samples = np.frombuffer(raw_pcm, dtype=np.int16)
            samples = samples.reshape(-1, orig_channels)
            mono_samples = samples.mean(axis=1).astype(np.int16)
            raw_pcm = mono_samples.tobytes()
        except Exception:
            pass

    # 4. Resample to target_sample_rate if needed
    if orig_rate != target_sample_rate:
        raw_pcm = resample_pcm(raw_pcm, in_rate=orig_rate, out_rate=target_sample_rate)

    # Save converted raw PCM wrapped in a clean WAV container for debug_exotel_output.wav
    try:
        wav_io = io.BytesIO()
        with wave.open(wav_io, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(target_sample_rate)
            wf.writeframes(raw_pcm)
        with open("debug_exotel_output.wav", "wb") as f:
            f.write(wav_io.getvalue())
    except Exception:
        pass

    metadata = {
        "orig_format": orig_format,
        "orig_rate": orig_rate,
        "orig_channels": orig_channels,
        "orig_bytes": orig_bytes,
        "pcm_bytes": len(raw_pcm),
        "target_rate": target_sample_rate,
    }

    return raw_pcm, metadata


def pcm_to_b64_payload(pcm_bytes: bytes) -> str:
    """Base64 encode raw PCM audio bytes for Exotel media message."""
    if not pcm_bytes:
        return ""
    return base64.b64encode(pcm_bytes).decode("ascii")

