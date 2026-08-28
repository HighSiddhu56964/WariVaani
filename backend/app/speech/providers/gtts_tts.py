import io
from app.core.config import settings


class gTTSTTS:
    """
    Optional development gTTS provider producing Marathi audio ('mr').
    Used only when explicitly configured via TTS_PROVIDER=gtts.
    """

    def synthesize(self, text: str, language: str = "mr") -> bytes:
        if not text or not text.strip():
            return b""

        try:
            from gtts import gTTS

            lang_code = "mr" if language in ["mr", "marathi"] else language
            tts = gTTS(text=text, lang=lang_code, slow=False)

            mp3_fp = io.BytesIO()
            tts.write_to_fp(mp3_fp)
            mp3_fp.seek(0)

            return mp3_fp.read()
        except Exception as e:
            print(f"❌ [gTTS Synthesis Error]: {e}")
            return b""
