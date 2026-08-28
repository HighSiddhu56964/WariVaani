"""
WariVaani (वारीवाणी) - Local Marathi Voice Pipeline
Sarvam Saaras v3 STT + Sarvam Bulbul v3 TTS

Run from warivaani/backend/:
    python -m app.speech.voice_cli
"""

import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.database.connection import SessionLocal
from app.agent.conversation import conversation_manager
from app.agent.normalizer import normalize
from app.speech.audio import AudioRecorder, AudioPlayer
from app.speech.stt import get_stt_provider
from app.speech.tts import get_tts_provider
from app.core.config import settings


def _stt_display_name() -> str:
    p = (settings.STT_PROVIDER or "sarvam").lower()
    if p in ["sarvam", "saaras", "sarvam_stt"]:
        return "Sarvam Saaras v3"
    elif p in ["faster_whisper", "faster-whisper", "whisper"]:
        return "faster-whisper"
    elif p in ["indicconformer", "indic_conformer"]:
        return "AI4Bharat IndicConformer Marathi"
    return p


def _tts_display_name() -> str:
    p = (settings.TTS_PROVIDER or "sarvam").lower()
    if p == "sarvam":
        return "Sarvam Bulbul v3"
    return p


def _play(tts_provider, text: str) -> float:
    """Synthesize and play audio. Returns TTS latency in seconds."""
    if hasattr(tts_provider, "synthesize_with_timing"):
        audio_bytes, latency = tts_provider.synthesize_with_timing(text, language="mr-IN")
    else:
        t0 = time.time()
        audio_bytes = tts_provider.synthesize(text, language="mr-IN")
        latency = time.time() - t0

    if audio_bytes:
        AudioPlayer.play_audio(audio_bytes, format_hint="wav")
    return latency


def run_voice_cli():
    stt_name = _stt_display_name()
    tts_name = _tts_display_name()
    stt_lang = getattr(settings, "SARVAM_STT_LANGUAGE", "mr-IN")

    print("=" * 68)
    print("🎙️  WariVaani (वारीवाणी) — Local Marathi Voice Pipeline")
    print(f"STT     : {stt_name}")
    print(f"Language: Marathi ({stt_lang})")
    print(f"TTS     : {tts_name}")
    print("=" * 68)

    # ── Initialize speech providers ─────────────────────────────────────
    try:
        stt_provider = get_stt_provider()
        tts_provider = get_tts_provider()
    except Exception as e:
        print(f"\n❌ [Startup Aborted]: {e}")
        sys.exit(1)

    session_id = "voice-session-001"
    recorder = AudioRecorder(sample_rate=16000)

    # ── Welcome greeting (only once at startup) ─────────────────────────
    from app.agent.response_style import WELCOME
    print(f"\nWariVaani: {WELCOME}\n")
    try:
        _play(tts_provider, WELCOME)
    except Exception as e:
        print(f"⚠️  [Welcome greeting audio skipped]: {e}")

    db = SessionLocal()
    try:
        while True:
            print("-" * 68)
            try:
                action = input("👉  [ENTER] to START recording  |  type 'exit' to quit: ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\nपुन्हा भेटू! जय हरी विठ्ठल! 🚩")
                break

            if action.lower() in ["exit", "quit", "बाहेर"]:
                from app.agent.response_style import FAREWELL
                print(f"\nWariVaani: {FAREWELL}")
                try:
                    _play(tts_provider, FAREWELL)
                except Exception:
                    pass
                break

            # ── Record ────────────────────────────────────────────────
            print("🔴  [RECORDING] Speak Marathi now...")
            recorder.start_recording()
            input("⏹️   [ENTER] to STOP recording...")
            audio_bytes = recorder.stop_recording()

            if not audio_bytes:
                print("⚠️  No audio captured. Please check your microphone.")
                continue

            # ── STT ───────────────────────────────────────────────────
            print("⏳  Transcribing with Sarvam Saaras v3...")
            t_stt = time.time()
            try:
                raw_text = stt_provider.transcribe(audio_bytes, language="mr-IN")
                stt_latency = time.time() - t_stt
            except Exception as e:
                print(f"❌  [STT Error]: {e}")
                continue

            # ── Agent Process (Handles normalization & routing) ───────
            t_agent = time.time()
            response_text, intent, requires_followup = conversation_manager.process_message(
                session_id=session_id,
                message=raw_text,
                db=db
            )
            agent_latency = time.time() - t_agent

            trace = conversation_manager.get_last_trace(session_id)
            print(f"\n📋  Raw STT      : {raw_text if raw_text else '[unrecognized]'}")
            print(f"📋  Intent       : {intent.value}")
            print(f"📋  Confidence   : {trace['confidence']:.2f}")
            print(f"📋  Backend tool : {trace['backend_tool']}")
            print(f"\n🤖  Response     : {response_text}")

            # ── TTS ───────────────────────────────────────────────────
            try:
                tts_latency = _play(tts_provider, response_text)
            except Exception as e:
                print(f"❌  [TTS Error]: {e}")
                tts_latency = 0.0

            total_latency = stt_latency + agent_latency + tts_latency

            # ── Latency Benchmarks ─────────────────────────────────────
            print(f"\n⏱️  Latency Benchmarks:")
            print(f"   • STT latency             : {stt_latency:.2f} sec")
            print(f"   • Agent latency           : {agent_latency:.2f} sec")
            print(f"   • TTS first-audio latency : {tts_latency:.2f} sec")
            print(f"   • Total latency           : {total_latency:.2f} sec")

    finally:
        db.close()


if __name__ == "__main__":
    run_voice_cli()
