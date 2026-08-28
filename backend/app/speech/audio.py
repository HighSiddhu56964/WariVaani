import io
import wave
import time
import threading
import tempfile
import os
from typing import Optional


class AudioRecorder:
    """
    Push-to-talk audio recorder capturing 16kHz 16-bit mono WAV audio from microphone.
    """

    def __init__(self, sample_rate: int = 16000, channels: int = 1):
        self.sample_rate = sample_rate
        self.channels = channels
        self._is_recording = False
        self._frames = []
        self._thread: Optional[threading.Thread] = None

    def start_recording(self):
        """Start capturing microphone audio in background thread."""
        self._frames = []
        self._is_recording = True
        self._thread = threading.Thread(target=self._record_loop, daemon=True)
        self._thread.start()

    def _record_loop(self):
        try:
            import sounddevice as sd
            import numpy as np

            def callback(indata, frames, time_info, status):
                if self._is_recording:
                    self._frames.append(indata.copy())

            with sd.InputStream(
                samplerate=self.sample_rate,
                channels=self.channels,
                dtype="int16",
                callback=callback
            ):
                while self._is_recording:
                    sd.sleep(100)
        except Exception as e:
            print(f"\n❌ [Microphone Error]: Unable to record audio. Details: {e}")
            print("💡 Tip: Verify your microphone connection and Windows privacy permissions.")
            self._is_recording = False

    def stop_recording(self) -> bytes:
        """Stop capturing and return raw WAV audio bytes."""
        self._is_recording = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)

        if not self._frames:
            return b""

        try:
            import numpy as np
            audio_data = np.concatenate(self._frames, axis=0)

            # Export to in-memory WAV buffer
            wav_buffer = io.BytesIO()
            with wave.open(wav_buffer, "wb") as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(2)  # 16-bit PCM = 2 bytes
                wf.setframerate(self.sample_rate)
                wf.writeframes(audio_data.tobytes())

            return wav_buffer.getvalue()
        except Exception as e:
            print(f"❌ Error encoding WAV audio: {e}")
            return b""


class AudioPlayer:
    """Speaker output player for WAV and MP3 audio bytes."""

    @staticmethod
    def play_audio(audio_bytes: bytes, format_hint: str = "mp3"):
        """Play audio bytes through speakers."""
        if not audio_bytes:
            print("⚠️ No audio data to play.")
            return

        # Write to temporary file for playback
        suffix = f".{format_hint.lstrip('.')}"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name

        try:
            # Try playing using soundfile & sounddevice first if WAV
            if format_hint.lower() in ["wav", "pcm"]:
                import sounddevice as sd
                import scipy.io.wavfile as wavfile
                rate, data = wavfile.read(temp_file_path)
                sd.play(data, rate)
                sd.wait()
            else:
                # Fallback playback using native OS audio player / winsound / gTTS playback
                if os.name == "nt":
                    # Windows PowerShell/Cmd fallback play command
                    os.system(f'powershell -c "(New-Object Media.SoundPlayer \'{temp_file_path}\').PlaySync()" > NUL 2>&1')
                else:
                    os.system(f'aplay "{temp_file_path}" > /dev/null 2>&1 || afplay "{temp_file_path}" > /dev/null 2>&1')
        except Exception as e:
            print(f"⚠️ [Speaker Playback Notice]: Audio synthesized successfully, but speaker playback encountered an issue: {e}")
        finally:
            try:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
            except Exception:
                pass
