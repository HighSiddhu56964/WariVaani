"""Deterministic, session-aware Marathi conversation manager with multi-Palkhi support."""

from __future__ import annotations

import re
import time
from enum import Enum
from typing import Any, Dict, Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.agent import tools
from app.agent.intents import Intent
from app.agent.normalizer import normalize
from app.agent.response_style import (
    DATA_UNAVAILABLE,
    GREETING_REPLY,
    GREETING_VITHAL_REPLY,
    HELP_REPLY,
    IDENTITY_REPLY,
    MISSING_CANCELLED,
    THANKS_REPLY,
    get_unknown_response,
    missing_age_reply,
    missing_clothing_reply,
    missing_confirm_reply,
    missing_location_reply,
    missing_start_reply,
    partial_recognition_reply,
)
from app.agent.router import intent_router
from app.models.palkhi import Palkhi


class Step(str, Enum):
    IDLE = "IDLE"
    AWAITING_PALKHI_SELECTION = "AWAITING_PALKHI_SELECTION"
    ASK_NAME = "ASK_NAME"
    ASK_AGE = "ASK_AGE"
    ASK_CLOTHING = "ASK_CLOTHING"
    ASK_LOCATION = "ASK_LOCATION"
    ASK_CONTACT = "ASK_CONTACT"
    CONFIRMATION = "CONFIRMATION"
    AWAITING_MEDICAL_LOCATION = "AWAITING_MEDICAL_LOCATION"


class SessionState:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.step = Step.IDLE
        self.active_intent = Intent.UNKNOWN
        self.data: Dict[str, Any] = {}
        self.last_intent = Intent.UNKNOWN
        self.selected_palkhi_id: Optional[int] = None
        self.pending_palkhi_intent: Optional[Intent] = None
        self.last_normalized = ""
        self.last_confidence = 0.0
        self.last_debug_hint = ""
        self.last_backend_latency = 0.0
        self.last_tool_name: Optional[str] = None

    def reset_flow(self) -> None:
        """End a form flow without discarding selected Palkhi session context."""
        self.step = Step.IDLE
        self.active_intent = Intent.UNKNOWN
        self.pending_palkhi_intent = None
        self.data.clear()


CONTEXTUAL_FOLLOWUP_PALKHI = (
    "पुढे", "पुढचे", "पुढचा", "नंतर", "मग", "किती दूर",
    "पुढील थांबा", "आणखी", "कधी", "वेळ", "मुक्काम", "रिंगण"
)

_MARATHI_AGES = {
    "एक": 1, "दोन": 2, "तीन": 3, "चार": 4, "पाच": 5,
    "सहा": 6, "सात": 7, "आठ": 8, "नऊ": 9, "दहा": 10,
    "अकरा": 11, "बारा": 12, "तेरा": 13, "चौदा": 14, "पंधरा": 15,
}


def _is_palkhi_followup(text: str) -> bool:
    return any(keyword in text.lower() for keyword in CONTEXTUAL_FOLLOWUP_PALKHI)


def _extract_age(text: str):
    converted = text.translate(str.maketrans("०१२३४५६७८९", "0123456789"))
    digits = re.findall(r"\d+", converted)
    if digits:
        return int(digits[0])
    for word, value in _MARATHI_AGES.items():
        if word in text:
            return value
    return text


def _detect_palkhi_id_from_text(text: str, db: Session) -> Optional[int]:
    t = text.lower()
    if "तुकाराम" in t or "तुकोबा" in t or "tukaram" in t:
        p = db.scalars(select(Palkhi).where(Palkhi.name.ilike("%Tukaram%"))).first()
        if p:
            return p.id
    if "ज्ञानेश्वर" in t or "ज्ञानोबा" in t or "माऊली" in t or "dnyaneshwar" in t or "dnyanoba" in t:
        p = db.scalars(select(Palkhi).where(Palkhi.name.ilike("%Dnyaneshwar%"))).first()
        if p:
            return p.id
    return None


class ConversationManager:
    """Routes normalized utterances and maintains state per caller session."""

    def __init__(self):
        self._sessions: Dict[str, SessionState] = {}

    def get_session(self, session_id: str) -> SessionState:
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionState(session_id)
        return self._sessions[session_id]

    def get_last_trace(self, session_id: str) -> dict:
        session = self.get_session(session_id)
        return {
            "normalized": session.last_normalized,
            "confidence": session.last_confidence,
            "debug_hint": session.last_debug_hint,
            "backend_latency": session.last_backend_latency,
            "backend_tool": session.last_tool_name,
        }

    @staticmethod
    def _backend_call(session: SessionState, label: str, function, *args):
        started = time.perf_counter()
        session.last_tool_name = label
        try:
            return function(*args)
        except Exception as exc:
            print(f"[BACKEND ERROR] {label}: {type(exc).__name__}: {exc}")
            return None
        finally:
            session.last_backend_latency += time.perf_counter() - started

    def _execute_palkhi_tool(self, intent: Intent, session: SessionState, db: Session) -> str:
        pid = session.selected_palkhi_id
        if intent == Intent.GET_PALKHI_LOCATION:
            return self._backend_call(session, "get_palkhi_location", tools.get_palkhi_location_tool, db, pid)
        elif intent == Intent.GET_NEXT_HALT:
            return self._backend_call(session, "get_next_halt", tools.get_next_halt_tool, db, pid)
        elif intent == Intent.GET_NEXT_RINGAN:
            return self._backend_call(session, "get_next_ringan", tools.get_next_ringan_tool, db, pid)
        elif intent == Intent.GET_PALKHI_ROUTE:
            return self._backend_call(session, "get_palkhi_route_summary", tools.get_palkhi_route_summary_tool, db, pid)
        return DATA_UNAVAILABLE

    def process_message(
        self, session_id: str, message: str, db: Session
    ) -> Tuple[str, Intent, bool]:
        session = self.get_session(session_id)
        is_name_step = session.step in (Step.ASK_NAME, Step.ASK_CLOTHING, Step.ASK_LOCATION)
        normalized = normalize(message.strip(), is_proper_name=is_name_step)
        session.last_normalized = normalized
        session.last_confidence = 1.0 if session.step != Step.IDLE else 0.0
        session.last_debug_hint = "active-flow" if session.step != Step.IDLE else ""
        session.last_backend_latency = 0.0
        session.last_tool_name = None

        if not normalized:
            session.last_debug_hint = "empty input"
            return get_unknown_response(), Intent.UNKNOWN, False

        # --- Contextual Palkhi Follow-ups ---
        if (
            session.step == Step.IDLE
            and session.last_intent in (Intent.GET_PALKHI_LOCATION, Intent.GET_NEXT_HALT, Intent.GET_NEXT_RINGAN, Intent.GET_PALKHI_ROUTE)
            and _is_palkhi_followup(normalized)
        ):
            session.last_confidence = 0.95
            session.last_debug_hint = "context:palkhi_followup"
            detected_pid = _detect_palkhi_id_from_text(normalized, db)
            if detected_pid:
                session.selected_palkhi_id = detected_pid

            if any(w in normalized for w in ("रिंगण", "ringan")):
                target_intent = Intent.GET_NEXT_RINGAN
            elif any(w in normalized for w in ("मुक्काम", "थांबा")):
                target_intent = Intent.GET_NEXT_HALT
            elif "किती" in normalized:
                target_intent = Intent.GET_PALKHI_ROUTE
            else:
                target_intent = session.last_intent

            response = self._execute_palkhi_tool(target_intent, session, db)
            return response or DATA_UNAVAILABLE, Intent.GET_PALKHI_LOCATION, False

        if session.step != Step.IDLE:
            return self._continue_flow(session, normalized, db)

        intent, confidence, debug_hint = intent_router.classify(normalized)
        session.last_confidence = confidence
        session.last_debug_hint = debug_hint

        # Check explicit Palkhi mention in query
        detected_pid = _detect_palkhi_id_from_text(normalized, db)
        if detected_pid:
            session.selected_palkhi_id = detected_pid

        # Palkhi queries requiring Palkhi context
        if intent in (Intent.GET_PALKHI_LOCATION, Intent.GET_NEXT_HALT, Intent.GET_NEXT_RINGAN, Intent.GET_PALKHI_ROUTE):
            session.last_intent = intent
            response = self._execute_palkhi_tool(intent, session, db)
            return response or DATA_UNAVAILABLE, intent, False

        if intent == Intent.GET_NEAREST_MEDICAL:
            session.last_intent = intent
            result = self._backend_call(
                session, "find_nearest_medical", tools.find_nearest_medical_tool,
                db, normalized,
            )
            if result is None:
                return DATA_UNAVAILABLE, intent, False
            response, requires_followup = result
            if requires_followup:
                session.step = Step.AWAITING_MEDICAL_LOCATION
                session.active_intent = intent
            return response, intent, requires_followup

        if intent == Intent.REPORT_MISSING_PERSON:
            session.step = Step.ASK_NAME
            session.active_intent = intent
            session.last_intent = intent
            is_female = any(
                word in normalized for word in ("मुलगी", "आई", "महिला", "ती", "बहीण")
            )
            return missing_start_reply(is_female), intent, True

        if intent == Intent.GENERAL_CONVERSATION:
            session.last_intent = Intent.UNKNOWN
            if "identity" in debug_hint:
                return IDENTITY_REPLY, Intent.UNKNOWN, False
            elif "greeting_vithal" in debug_hint:
                return GREETING_VITHAL_REPLY, Intent.UNKNOWN, False
            elif "greeting" in debug_hint:
                return GREETING_REPLY, Intent.UNKNOWN, False
            elif "goodbye" in debug_hint:
                return FAREWELL, Intent.UNKNOWN, False
            elif "thanks" in debug_hint:
                return THANKS_REPLY, Intent.UNKNOWN, False
            elif "help_request" in debug_hint:
                return HELP_REPLY, Intent.UNKNOWN, False
            return GREETING_REPLY, Intent.UNKNOWN, False

        session.last_intent = Intent.UNKNOWN
        # Handle greetings or goodbyes in natural language
        if any(g in normalized for g in ("नमस्ते", "नमस्कार", "राम कृष्ण हरी", "जय हरी", "हॅलो", "hello", "hi")):
            return GREETING_REPLY, Intent.UNKNOWN, False
        if any(g in normalized for g in ("बाय", "गुडबाय", "bye", "goodbye", "पुन्हा भेटू")):
            return FAREWELL, Intent.UNKNOWN, False

        if debug_hint.startswith("partial:"):
            topic = debug_hint.split(":", 1)[1]
            if topic == "पालखी":
                response = "तुम्ही पालखी कुठे आहे असं विचारत आहात का?"
            elif topic == "वैद्यकीय मदत":
                response = "तुम्ही जवळचे वैद्यकीय केंद्र शोधत आहात का?"
            elif topic == "हरवलेली व्यक्ती":
                response = "तुम्ही हरवलेल्या व्यक्तीची नोंद करू इच्छिता का?"
            else:
                response = partial_recognition_reply(topic)
        else:
            response = get_unknown_response()

        return response, Intent.UNKNOWN, False

    def _continue_flow(
        self, session: SessionState, text: str, db: Session
    ) -> Tuple[str, Intent, bool]:
        # 1. Global cancellation
        if any(w in text.lower() for w in ("रद्द", "नको", "थांबा", "cancel")):
            session.reset_flow()
            return "ठीक आहे. सांगा, आणखी कशी मदत करू?", Intent.UNKNOWN, False

        # 2. Palkhi Selection follow-up state
        if session.step == Step.AWAITING_PALKHI_SELECTION:
            detected_pid = _detect_palkhi_id_from_text(text, db)
            if not detected_pid:
                if any(w in text for w in ("१", "पहिली", "पाहिली", "प्रथम")):
                    p = db.scalars(select(Palkhi).where(Palkhi.name.ilike("%Dnyaneshwar%"))).first()
                    detected_pid = p.id if p else 1
                elif any(w in text for w in ("२", "दुसरी")):
                    p = db.scalars(select(Palkhi).where(Palkhi.name.ilike("%Tukaram%"))).first()
                    detected_pid = p.id if p else 2

            if detected_pid:
                session.selected_palkhi_id = detected_pid
                pending_intent = session.pending_palkhi_intent or Intent.GET_PALKHI_LOCATION
                session.reset_flow()
                session.last_intent = pending_intent
                response = self._execute_palkhi_tool(pending_intent, session, db)
                return response or DATA_UNAVAILABLE, pending_intent, False

            # If user didn't select Palkhi but asked something else:
            session.reset_flow()
            return self.process_message(session.session_id, text, db)

        # 3. Medical location state check
        if session.step == Step.AWAITING_MEDICAL_LOCATION:
            coords = tools.resolve_location_name(text)
            if not coords:
                intent, confidence, debug_hint = intent_router.classify(text)
                if intent != Intent.UNKNOWN or any(w in text.lower() for w in ("राम कृष्ण हरी", "जय हरी", "धन्यवाद", "तुम्ही कोण")):
                    session.reset_flow()
                    return self.process_message(session.session_id, text, db)

            result = self._backend_call(
                session, "find_nearest_medical", tools.find_nearest_medical_tool, db, text
            )
            if result is None:
                session.reset_flow()
                return DATA_UNAVAILABLE, Intent.GET_NEAREST_MEDICAL, False
            response, requires_followup = result
            if not requires_followup:
                session.reset_flow()
            return response, Intent.GET_NEAREST_MEDICAL, requires_followup

        # 4. Missing person multi-turn flow
        intent = Intent.REPORT_MISSING_PERSON
        if session.step == Step.ASK_NAME:
            session.data["name"] = text
            session.step = Step.ASK_AGE
            return missing_age_reply(text), intent, True

        if session.step == Step.ASK_AGE:
            session.data["age"] = _extract_age(text)
            session.step = Step.ASK_CLOTHING
            return missing_clothing_reply(session.data["name"]), intent, True

        if session.step == Step.ASK_CLOTHING:
            session.data["clothing"] = text
            session.step = Step.ASK_LOCATION
            return missing_location_reply(session.data["name"]), intent, True

        if session.step == Step.ASK_LOCATION:
            session.data["last_seen_location"] = text
            session.step = Step.ASK_CONTACT
            return "ठीक आहे. तुमचा मोबाईल नंबर सांगा.", intent, True

        if session.step == Step.ASK_CONTACT:
            session.data["contact"] = text
            session.step = Step.CONFIRMATION
            return missing_confirm_reply(
                session.data.get("name", ""), session.data.get("age", ""),
                session.data.get("clothing", ""), session.data.get("last_seen_location", ""),
            ), intent, True

        if session.step == Step.CONFIRMATION:
            affirmative = ("हो", "बरोबर", "होय", "yes", "योग्य", "correct", "ठीक")
            if any(word in text.lower() for word in affirmative):
                ticket = self._backend_call(
                    session, "create_missing_person_report",
                    tools.create_missing_person_report_tool, db, dict(session.data),
                )
                session.reset_flow()
                return ticket or DATA_UNAVAILABLE, intent, False
            session.reset_flow()
            return MISSING_CANCELLED, intent, False

        session.reset_flow()
        return get_unknown_response(), Intent.UNKNOWN, False


conversation_manager = ConversationManager()
