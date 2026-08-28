import io
from app.core.config import settings


class GoogleSTT:
    """
    Optional development Google SpeechRecognition provider for Marathi ('mr-IN').
    Used only when explicitly configured via STT_PROVIDER=google.
    """

    def transcribe(self, audio_bytes: bytes, language: str = "mr") -> str:
        if not audio_bytes:
            return ""

        try:
            import speech_recognition as sr

            recognizer = sr.Recognizer()
            audio_file = io.BytesIO(audio_bytes)

            with sr.AudioFile(audio_file) as source:
                audio_data = recognizer.record(source)

            lang_code = "mr-IN" if language in ["mr", "marathi"] else language
            text = recognizer.recognize_google(audio_data, language=lang_code)
            return text.strip()
        except sr.UnknownValueError:
            print("⚠️ [Google STT]: Could not understand speech audio.")
            return ""
        except sr.RequestError as e:
            print(f"❌ [Google STT Service Error]: {e}")
            return ""
        except Exception as e:
            print(f"❌ [Google STT Exception]: {e}")
            return ""
