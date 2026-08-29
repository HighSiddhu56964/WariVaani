"""
WariVaani Exotel Session Manager Module
Manages state for active telephone calls, reading actual Exotel media formats,
tracking turn states, and mapping Exotel Call SID to WariVaani conversation sessions.
"""

import sys
import time
from typing import Dict, Optional

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.telephony.audio_buffer import AudioBuffer
from app.agent.conversation import conversation_manager


class ExotelSession:
    """Represents a single active Exotel Voicebot phone call session."""

    def __init__(
        self,
        stream_sid: str,
        call_sid: Optional[str] = None,
        caller_number: Optional[str] = None,
        encoding: str = "audio/x-l16",
        sample_rate: int = 16000,
        bit_rate: int = 16,
    ):
        self.stream_sid = stream_sid
        self.call_sid = call_sid or stream_sid
        self.caller_number = caller_number or "unknown"
        self.encoding = encoding
        self.sample_rate = sample_rate
        self.bit_rate = bit_rate

        self.start_time = time.time()
        self.audio_buffer = AudioBuffer(sample_rate=self.sample_rate, silence_threshold_ms=800)

        self.is_active = True
        self.greeting_sent = False
        self.is_processing = False
        self.is_bot_speaking = False
        self.current_mark_name: Optional[str] = None
        self.last_voice_timestamp: float = 0.0

    def get_conversation_session_id(self) -> str:
        """
        Returns the persistent conversation session ID for this call.
        Uses Call SID to ensure multi-turn context (e.g. missing person flow) persists.
        """
        return self.call_sid or self.stream_sid


class ExotelSessionManager:
    """Registry managing active Exotel phone calls."""

    def __init__(self):
        self._sessions: Dict[str, ExotelSession] = {}

    def create_session(
        self,
        stream_sid: str,
        call_sid: Optional[str] = None,
        caller_number: Optional[str] = None,
        encoding: str = "audio/x-l16",
        sample_rate: int = 16000,
        bit_rate: int = 16,
    ) -> ExotelSession:
        """Create and register a new Exotel phone call session with actual media format parameters."""
        session = ExotelSession(
            stream_sid=stream_sid,
            call_sid=call_sid,
            caller_number=caller_number,
            encoding=encoding,
            sample_rate=sample_rate,
            bit_rate=bit_rate,
        )
        self._sessions[stream_sid] = session
        return session

    def get_session(self, stream_sid: str) -> Optional[ExotelSession]:
        """Retrieve active call session by Stream SID."""
        return self._sessions.get(stream_sid)

    def close_session(self, stream_sid: str):
        """
        Teardown active call session.
        Removes temporary in-memory conversation state from ConversationManager
        WITHOUT deleting database records (e.g. missing person tickets).
        """
        session = self._sessions.pop(stream_sid, None)
        if session:
            session.is_active = False
            conv_id = session.get_conversation_session_id()
            if conv_id in conversation_manager._sessions:
                del conversation_manager._sessions[conv_id]


# Singleton session manager instance
exotel_session_manager = ExotelSessionManager()
