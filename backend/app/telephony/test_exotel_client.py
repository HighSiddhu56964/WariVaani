import sys
import json
import base64
import asyncio
import numpy as np
import websockets

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def generate_dummy_pcm(duration_sec: float = 1.0, sample_rate: int = 16000) -> bytes:
    t = np.linspace(0, duration_sec, int(sample_rate * duration_sec), False)
    tone = np.sin(2 * np.pi * 440 * t)
    audio_int16 = (tone * 32767).astype(np.int16)
    return audio_int16.tobytes()

async def simulate_exotel_call(ws_url: str = "ws://127.0.0.1:8000/telephony/exotel"):
    print("=" * 68)
    print(f"WariVaani Exotel Local WebSocket Simulator Test Client: {ws_url}")
    print("=" * 68)

    stream_sid = "test-stream-sim-005"
    call_sid = "test-call-sim-005"

    try:
        async with websockets.connect(ws_url) as ws:
            print("[Connected] Local WebSocket connection established!")

            connected_msg = {"event": "connected", "protocol": "Voice", "version": "1.0.0"}
            await ws.send(json.dumps(connected_msg))
            print("[Sent] 'connected' event JSON")
            await asyncio.sleep(0.2)

            start_msg = {
                "event": "start",
                "sequenceNumber": "1",
                "stream_sid": stream_sid,
                "streamSid": stream_sid,
                "start": {
                    "stream_sid": stream_sid,
                    "call_sid": call_sid,
                    "account_sid": "test-account",
                    "from": "+919876543210",
                    "to": "+918000000000",
                    "media_format": {
                        "encoding": "audio/x-l16",
                        "sample_rate": "16kHz",
                        "bit_rate": "128kbps",
                        "channels": 1
                    }
                }
            }
            await ws.send(json.dumps(start_msg))
            print("[Sent] 'start' event JSON")

            # Receive welcome greeting frames until mark
            greeting_mark_received = False
            while not greeting_mark_received:
                reply = await asyncio.wait_for(ws.recv(), timeout=10.0)
                data = json.loads(reply)
                evt = data.get("event")
                if evt == "mark":
                    mark_name = data.get("mark", {}).get("name", "")
                    print(f"[Received Mark Event] Name: {mark_name}")
                    echo_mark = {
                        "event": "mark",
                        "stream_sid": stream_sid,
                        "mark": {"name": mark_name}
                    }
                    await ws.send(json.dumps(echo_mark))
                    print("[Echoed Mark Event Back to Server]")
                    greeting_mark_received = True

            stop_msg = {
                "event": "stop",
                "sequenceNumber": "999",
                "stream_sid": stream_sid,
                "stop": {"call_sid": call_sid, "stream_sid": stream_sid}
            }
            await ws.send(json.dumps(stop_msg))
            print("[Sent] 'stop' event JSON")
            await asyncio.sleep(0.2)

            print("\nExotel WebSocket Simulation completed successfully!")

    except Exception as e:
        print(f"[Simulation Failed]: {e}")

if __name__ == "__main__":
    asyncio.run(simulate_exotel_call())
