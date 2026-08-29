"""
WariVaani Exotel Telephony Handler
FastAPI WebSocket endpoint (WS /telephony/exotel) & Health API (GET /telephony/health).
Integrates Exotel Voicebot Applet with WariVaani Marathi voice pipeline.
"""

import sys
import json
import time
import re
import asyncio
import traceback
from typing import Optional

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.config import settings
from app.database.connection import SessionLocal
from app.telephony.exotel_session import exotel_session_manager, ExotelSession
from app.telephony.audio_buffer import (
    extract_pcm_from_tts,
    convert_tts_to_exotel_pcm,
    pcm_to_b64_payload,
    resample_pcm,
)
from app.speech.stt import get_stt_provider
from app.speech.tts import get_tts_provider
from app.agent.conversation import conversation_manager

router = APIRouter(tags=["telephony"])

WELCOME_GREETING = "राम कृष्ण हरी! वारीवाणीमध्ये आपले स्वागत आहे. सांगा, मी कशी मदत करू?"
RETRY_PROMPT = "माफ करा, पुन्हा एकदा सांगाल का?"


def parse_sample_rate(val) -> int:
    """
    Safely parse sample rate from int or string (e.g. 16000, '16000', '16kHz', '8kHz').
    Falls back to Exotel default 8000 Hz if parsing fails.
    """
    if val is None:
        return 8000
    if isinstance(val, (int, float)):
        return int(val)
    val_str = str(val).strip().lower()
    try:
        if "khz" in val_str:
            num = float(re.sub(r"[^\d.]", "", val_str.replace("khz", "")))
            return int(num * 1000)
        if "hz" in val_str:
            num = float(re.sub(r"[^\d.]", "", val_str.replace("hz", "")))
            return int(num)
        digits = re.sub(r"[^\d.]", "", val_str)
        if digits:
            return int(float(digits))
    except Exception as e:
        print(f"⚠️ [EXOTEL PARSE WARN] Failed to parse sample rate raw '{val}': {e}. Defaulting to 8000 Hz", flush=True)
    return 8000


def parse_bit_rate(val) -> int:
    """
    Safely parse bit rate from int or string (e.g. 128000, '128000', '128kbps', '64kbps', '16-bit').
    Falls back to 128000 if parsing fails.
    """
    if val is None:
        return 128000
    if isinstance(val, (int, float)):
        return int(val)
    val_str = str(val).strip().lower()
    try:
        if "kbps" in val_str or "kbit" in val_str or "k" in val_str:
            digits = re.sub(r"[^\d.]", "", val_str)
            if digits:
                return int(float(digits) * 1000)
        digits = re.sub(r"[^\d.]", "", val_str)
        if digits:
            return int(float(digits))
    except Exception as e:
        print(f"⚠️ [EXOTEL PARSE WARN] Failed to parse bit rate raw '{val}': {e}. Defaulting to 128000", flush=True)
    return 128000


@router.get("/telephony/health")
async def telephony_health():
    """Health check endpoint for Exotel telephony module."""
    return {
        "status": "ok",
        "provider": "exotel",
        "mode": "voicebot_bidirectional",
        "websocket": "/telephony/exotel",
        "enabled": getattr(settings, "EXOTEL_ENABLED", True),
        "sample_rate": getattr(settings, "EXOTEL_SAMPLE_RATE", 16000),
    }


@router.get("/telephony/debug")
async def telephony_debug():
    """Debug status endpoint for Exotel telephony route registration."""
    return {
        "telephony_enabled": getattr(settings, "EXOTEL_ENABLED", True),
        "websocket_route_registered": True,
        "expected_path": "/telephony/exotel",
        "server_port": 8000,
    }


@router.websocket("/telephony/test")
async def test_websocket_endpoint(websocket: WebSocket):
    """
    Temporary debugging endpoint to confirm FastAPI WebSocket support independently from Exotel logic.
    """
    await websocket.accept()
    print("[TEST WS] connected", flush=True)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"[TEST WS] received: {data}", flush=True)
            await websocket.send_text(f"echo: {data}")
    except WebSocketDisconnect:
        print("[TEST WS] disconnected", flush=True)
    except Exception as e:
        print(f"[TEST WS] error: {e}", flush=True)



async def _send_exotel_audio(
    websocket: WebSocket,
    stream_sid: str,
    audio_bytes: bytes,
    session: ExotelSession,
    mark_name: str,
):
    """
    Convert TTS output into Exotel signed-linear 16-bit PCM, chunk in 320-byte multiples,
    stream media frames with controlled pacing, attach mark event for playback tracking,
    and log details without printing raw base64.
    """
    if not audio_bytes or not session.is_active:
        return

    try:
        pcm_out, meta = convert_tts_to_exotel_pcm(
            audio_bytes, target_sample_rate=session.sample_rate
        )

        if not pcm_out:
            return

        session.is_bot_speaking = True
        session.current_mark_name = mark_name

        # Calculate chunk size aligned to 320-byte multiples (~100ms chunks)
        chunk_unit = 320
        target_ms = 0.10  # 100 ms
        desired_bytes = int(session.sample_rate * target_ms * 2)
        chunk_size = max(chunk_unit, (desired_bytes // chunk_unit) * chunk_unit)

        chunks = []
        for i in range(0, len(pcm_out), chunk_size):
            chunk = pcm_out[i : i + chunk_size]
            if len(chunk) < chunk_size:
                remainder = len(chunk) % chunk_unit
                if remainder != 0:
                    pad_len = chunk_unit - remainder
                    chunk += b"\x00" * pad_len
            chunks.append(chunk)

        last_chunk_size = len(chunks[-1]) if chunks else 0

        # Required console logging (no raw base64 printed!)
        print("\n[TTS AUDIO]", flush=True)
        print(f"Original format: {meta.get('orig_format')}", flush=True)
        print(f"Original sample rate: {meta.get('orig_rate')}", flush=True)
        print(f"Original channels: {meta.get('orig_channels')}", flush=True)
        print(f"Original bytes: {meta.get('orig_bytes')}\n", flush=True)

        print("[EXOTEL AUDIO]", flush=True)
        print(f"Sample rate: {session.sample_rate}", flush=True)
        print("Channels: 1", flush=True)
        print("Sample width: 16-bit", flush=True)
        print(f"PCM bytes: {len(pcm_out)}", flush=True)
        print(f"Chunk count: {len(chunks)}", flush=True)
        print(f"Chunk size: {chunk_size}", flush=True)
        print(f"Last chunk size: {last_chunk_size}\n", flush=True)

        # Stream chunks with ~95ms pacing per 100ms chunk
        sleep_interval = target_ms * 0.95
        for chunk in chunks:
            if not session.is_active or not session.is_bot_speaking:
                break
            b64_chunk = pcm_to_b64_payload(chunk)
            if not b64_chunk:
                continue

            media_msg = {
                "event": "media",
                "stream_sid": stream_sid,
                "streamSid": stream_sid,
                "media": {"payload": b64_chunk},
            }
            await websocket.send_json(media_msg)
            await asyncio.sleep(sleep_interval)

        # Send matching mark event after final chunk
        if session.is_active and session.is_bot_speaking:
            mark_msg = {
                "event": "mark",
                "stream_sid": stream_sid,
                "streamSid": stream_sid,
                "mark": {"name": mark_name},
            }
            await websocket.send_json(mark_msg)

        audio_duration_sec = (len(pcm_out) / 2) / session.sample_rate
        asyncio.create_task(_mark_safety_timeout(session, mark_name, audio_duration_sec + 2.0))

    except Exception as send_err:
        print(
            f"[EXOTEL ERROR]\nEvent: send_audio\nException: {send_err}\nTraceback: {traceback.format_exc()}",
            flush=True,
        )
        session.is_bot_speaking = False
        session.is_processing = False


async def _mark_safety_timeout(session: ExotelSession, mark_name: str, timeout_sec: float):
    """Fallback safety timer to release bot speaking lock if Exotel omits mark event."""
    await asyncio.sleep(timeout_sec)
    if session.is_active and session.current_mark_name == mark_name and session.is_bot_speaking:
        session.is_bot_speaking = False
        session.is_processing = False
        session.current_mark_name = None
        session.audio_buffer.clear()


@router.websocket("/telephony/exotel")
async def handle_exotel_websocket(websocket: WebSocket):
    """
    Exotel Voicebot Bidirectional WebSocket Handler (WS /telephony/exotel).
    Maintains persistent WebSocket connection for the full duration of a phone call.
    """
    print("[EXOTEL] Incoming WebSocket request", flush=True)
    await websocket.accept()
    print("[EXOTEL] WebSocket accepted", flush=True)
    print("[EXOTEL] connected", flush=True)

    stt_provider = get_stt_provider()
    tts_provider = get_tts_provider()
    db = SessionLocal()

    stream_sid: str = ""
    session: Optional[ExotelSession] = None
    media_count = 0

    try:
        while True:
            try:
                raw_msg = await websocket.receive_text()
            except WebSocketDisconnect:
                print("[EXOTEL] disconnected", flush=True)
                break
            except Exception as rx_err:
                print(f"[EXOTEL] websocket receive error: {rx_err}", flush=True)
                break

            if not raw_msg or not raw_msg.strip():
                continue

            try:
                data = json.loads(raw_msg)
            except Exception as json_err:
                print(
                    f"[EXOTEL ERROR]\nEvent: raw_json_decode\nException: {json_err}\nTraceback: {traceback.format_exc()}",
                    flush=True,
                )
                continue

            event_type = data.get("event") or data.get("event_type", "unknown")
            current_stream_sid = data.get("streamSid") or data.get("stream_sid") or stream_sid

            try:
                # ── 1. CONNECTED EVENT ──────────────────────────────────────────
                if event_type == "connected":
                    print("[EXOTEL] connected", flush=True)
                    continue

                # ── 2. START EVENT ──────────────────────────────────────────────
                elif event_type == "start":
                    print("[EXOTEL] start", flush=True)
                    start_obj = data.get("start", {})
                    media_format = start_obj.get("media_format") or start_obj.get("mediaFormat") or {}

                    raw_encoding = media_format.get("encoding") or "audio/x-l16"
                    raw_sample_rate = (
                        media_format.get("sample_rate")
                        or media_format.get("sampleRate")
                        or media_format.get("rate")
                        or 16000
                    )
                    raw_bit_rate = (
                        media_format.get("bit_rate")
                        or media_format.get("bitRate")
                        or 16
                    )

                    encoding = str(raw_encoding)
                    sample_rate = parse_sample_rate(raw_sample_rate)
                    bit_rate = parse_bit_rate(raw_bit_rate)

                    stream_sid = (
                        current_stream_sid
                        or start_obj.get("stream_sid")
                        or start_obj.get("streamSid")
                        or f"exotel-stream-{int(time.time())}"
                    )
                    call_sid = start_obj.get("call_sid") or start_obj.get("callSid") or data.get("callSid") or stream_sid
                    caller = start_obj.get("from") or start_obj.get("caller_number") or "unknown"

                    session = exotel_session_manager.create_session(
                        stream_sid=stream_sid,
                        call_sid=call_sid,
                        caller_number=caller,
                        encoding=encoding,
                        sample_rate=sample_rate,
                        bit_rate=bit_rate,
                    )

                    print(
                        f"\n[EXOTEL START]\n"
                        f"Encoding raw: {raw_encoding}\n"
                        f"Sample rate raw: {raw_sample_rate}\n"
                        f"Bit rate raw: {raw_bit_rate}\n\n"
                        f"Encoding: {encoding}\n"
                        f"Sample Rate: {sample_rate}\n"
                        f"Bit Rate: {bit_rate}\n",
                        flush=True,
                    )

                    # Send automatic welcome greeting ONCE per session
                    if not session.greeting_sent:
                        session.greeting_sent = True
                        print("[EXOTEL] Greeting generated", flush=True)
                        print("[EXOTEL] Sending greeting audio", flush=True)
                        try:
                            greeting_audio = tts_provider.synthesize(WELCOME_GREETING, language="mr-IN")
                            await _send_exotel_audio(
                                websocket,
                                stream_sid,
                                greeting_audio,
                                session,
                                mark_name=f"greeting-{stream_sid}",
                            )
                        except Exception as g_err:
                            print(
                                f"[EXOTEL ERROR]\nEvent: greeting\nException: {g_err}\nTraceback: {traceback.format_exc()}",
                                flush=True,
                            )

                    print("[EXOTEL] waiting for caller audio...", flush=True)
                    continue

                # ── 3. MARK EVENT (Playback Complete Handshake) ────────────────
                elif event_type == "mark":
                    mark_obj = data.get("mark", {})
                    mark_name = mark_obj.get("name", "")

                    if session and session.current_mark_name and mark_name == session.current_mark_name:
                        if mark_name.startswith("greeting"):
                            print("[EXOTEL] Greeting playback complete\n", flush=True)
                        else:
                            print("[EXOTEL] playback completed\n", flush=True)

                        session.is_bot_speaking = False
                        session.is_processing = False
                        session.current_mark_name = None
                        session.audio_buffer.clear()

                    continue

                # ── 4. CLEAR EVENT (Interruption / Barge-in) ───────────────────
                elif event_type == "clear":
                    if session:
                        session.is_bot_speaking = False
                        session.is_processing = False
                        session.audio_buffer.clear()
                    continue

                # ── 5. MEDIA EVENT (Caller Audio Input) ─────────────────────────
                elif event_type == "media":
                    if media_count == 0:
                        print("[EXOTEL] media received", flush=True)
                    media_count += 1

                    if not session:
                        continue

                    media_payload = data.get("media", {})
                    b64_chunk = media_payload.get("payload", "")
                    if not b64_chunk:
                        continue

                    if session.is_processing:
                        continue

                    speech_detected, utterance_complete, audio_dur = session.audio_buffer.process_b64_chunk(b64_chunk)

                    if speech_detected and session.is_bot_speaking:
                        session.is_bot_speaking = False
                        clear_msg = {
                            "event": "clear",
                            "stream_sid": stream_sid,
                            "streamSid": stream_sid,
                        }
                        await websocket.send_json(clear_msg)

                    if utterance_complete:
                        session.is_processing = True
                        wav_bytes = session.audio_buffer.get_wav_bytes()
                        session.audio_buffer.clear()

                        if not wav_bytes:
                            session.is_processing = False
                            continue

                        try:
                            raw_text = stt_provider.transcribe(wav_bytes, language="mr-IN")
                        except Exception as stt_err:
                            print(
                                f"[EXOTEL ERROR]\nEvent: stt\nException: {stt_err}\nTraceback: {traceback.format_exc()}",
                                flush=True,
                            )
                            raw_text = ""

                        cleaned_text = raw_text.strip() if raw_text else ""

                        if not cleaned_text:
                            print("[STT] [unrecognized]", flush=True)
                            print(f"[BOT] {RETRY_PROMPT}", flush=True)
                            try:
                                retry_audio = tts_provider.synthesize(RETRY_PROMPT, language="mr-IN")
                                print("[TTS] generated", flush=True)
                                print("[EXOTEL] sending response", flush=True)
                                await _send_exotel_audio(
                                    websocket,
                                    stream_sid,
                                    retry_audio,
                                    session,
                                    mark_name=f"retry-{int(time.time()*1000)}",
                                )
                            except Exception as r_err:
                                print(
                                    f"[EXOTEL ERROR]\nEvent: stt_retry\nException: {r_err}\nTraceback: {traceback.format_exc()}",
                                    flush=True,
                                )
                                session.is_processing = False
                            continue

                        print(f"[STT] {cleaned_text}", flush=True)

                        try:
                            response_text, intent, extra_data = conversation_manager.process_message(
                                session_id=session.get_conversation_session_id(),
                                message=cleaned_text,
                                db=db,
                            )
                        except Exception as agent_err:
                            print(
                                f"[EXOTEL ERROR]\nEvent: agent_process\nException: {agent_err}\nTraceback: {traceback.format_exc()}",
                                flush=True,
                            )
                            response_text = RETRY_PROMPT
                            intent = "error_fallback"
                            extra_data = {}

                        print(f"[INTENT] {intent}", flush=True)
                        tool_name = extra_data.get("tool") if isinstance(extra_data, dict) else None
                        if tool_name:
                            print(f"[TOOL] {tool_name}", flush=True)
                        print(f"[BOT] {response_text}", flush=True)

                        try:
                            reply_audio = tts_provider.synthesize(response_text, language="mr-IN")
                            print("[TTS] generated", flush=True)
                            print("[EXOTEL] sending response", flush=True)
                            await _send_exotel_audio(
                                websocket,
                                stream_sid,
                                reply_audio,
                                session,
                                mark_name=f"resp-{int(time.time()*1000)}",
                            )
                        except Exception as tts_err:
                            print(
                                f"[EXOTEL ERROR]\nEvent: tts_synthesis\nException: {tts_err}\nTraceback: {traceback.format_exc()}",
                                flush=True,
                            )
                            session.is_processing = False

                    continue

                # ── 6. DTMF EVENT ───────────────────────────────────────────────
                elif event_type == "dtmf":
                    continue

                # ── 7. STOP EVENT (Call Ended) ──────────────────────────────────
                elif event_type == "stop":
                    print("[EXOTEL] stop", flush=True)
                    if stream_sid:
                        exotel_session_manager.close_session(stream_sid)
                    break

            except Exception as event_err:
                print(
                    f"[EXOTEL ERROR]\nEvent: {event_type}\nException: {event_err}\nTraceback: {traceback.format_exc()}",
                    flush=True,
                )
                continue

    except WebSocketDisconnect:
        print("[EXOTEL] disconnected", flush=True)
    except Exception as e:
        print(
            f"[EXOTEL ERROR]\nEvent: websocket_loop\nException: {e}\nTraceback: {traceback.format_exc()}",
            flush=True,
        )
    finally:
        print("[EXOTEL] disconnected", flush=True)
        db.close()
        if stream_sid:
            exotel_session_manager.close_session(stream_sid)
