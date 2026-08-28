"""
WariVaani Phase 4 — Automated Tests
Covers: normalizer, fuzzy intent routing, humanized unknown, contextual flow.

Run from warivaani/backend/:
    pytest tests/test_phase4.py -v
"""

import pytest
from unittest.mock import MagicMock, patch

from app.agent.normalizer import normalize, fuzzy_contains_keyword
from app.agent.router import KeywordIntentRouter
from app.agent.intents import Intent
from app.agent.conversation import ConversationManager


# ===========================================================================
# 1. Normalizer Tests
# ===========================================================================

class TestNormalizer:

    def test_palkhi_variants(self):
        assert normalize("पलखी कुटे आहे") == "पालखी कुठे आहे"
        assert normalize("पालकी कुठे आहे") == "पालखी कुठे आहे"
        assert normalize("पलकी कुठे हाय") == "पालखी कुठे आहे"

    def test_mauli_variants(self):
        assert "माऊली" in normalize("माउली कुठे आली")
        assert "माऊली" in normalize("माउलि कुठवर आली")

    def test_hospital_variants(self):
        result = normalize("जवळ हॉस्पिटल आहे का")
        assert "इस्पितळ" in result

    def test_kuthe_variants(self):
        result = normalize("पालखी कुटे आहे")
        assert "कुठे" in result

    def test_hay_to_ahe(self):
        result = normalize("पालखी कुठे हाय")
        assert "आहे" in result

    def test_punctuation_stripped(self):
        result = normalize("पालखी कुठे आहे?")
        assert result == "पालखी कुठे आहे"

    def test_empty_input(self):
        assert normalize("") == ""
        assert normalize("   ") == ""

    def test_unicode_normalization(self):
        # Should not crash on any Unicode input
        result = normalize("माऊली")
        assert isinstance(result, str)


# ===========================================================================
# 2. Intent Router Tests (with normalized text)
# ===========================================================================

class TestIntentRouter:

    router = KeywordIntentRouter()

    def _intent(self, text: str) -> Intent:
        normalized = normalize(text)
        intent, confidence, _ = self.router.classify(normalized)
        return intent

    # Palkhi location
    def test_palkhi_exact(self):
        assert self._intent("पालखी कुठे आहे?") == Intent.GET_PALKHI_LOCATION

    def test_palkhi_spelling_variant(self):
        assert self._intent("पालकी कुटे आहे") == Intent.GET_PALKHI_LOCATION

    def test_palkhi_mauli(self):
        assert self._intent("माऊली कुठवर आली?") == Intent.GET_PALKHI_LOCATION

    def test_palkhi_dnyanoba(self):
        assert self._intent("ज्ञानोबांची पालखी कुठे?") == Intent.GET_PALKHI_LOCATION

    # Medical
    def test_medical_exact(self):
        assert self._intent("जवळ डॉक्टर कुठे मिळतील?") == Intent.GET_NEAREST_MEDICAL

    def test_medical_hospital_variant(self):
        assert self._intent("जवळ हॉस्पिटल आहे का?") == Intent.GET_NEAREST_MEDICAL

    def test_medical_davaakhana(self):
        assert self._intent("दवाखाना कुठे आहे?") == Intent.GET_NEAREST_MEDICAL

    # Missing person
    def test_missing_mulga(self):
        assert self._intent("माझा मुलगा हरवला आहे") == Intent.REPORT_MISSING_PERSON

    def test_missing_mulagi(self):
        assert self._intent("माझी मुलगी हरवली आहे") == Intent.REPORT_MISSING_PERSON

    def test_missing_vadil(self):
        assert self._intent("माझे वडील दिसत नाहीत") == Intent.REPORT_MISSING_PERSON

    def test_missing_sapdat_nahi(self):
        assert self._intent("माझी आई सापडत नाही") == Intent.REPORT_MISSING_PERSON

    # Unknown — must NOT return menu
    def test_unknown_returns_unknown(self):
        intent, _, _ = self.router.classify("random text")
        assert intent == Intent.UNKNOWN

    def test_confidence_exact_is_1(self):
        _, conf, _ = self.router.classify("पालखी कुठे आहे")
        assert conf == 1.0


# ===========================================================================
# 3. Conversation Manager Tests
# ===========================================================================

def _mock_db():
    return MagicMock()


class TestConversationHumanized:

    def _manager(self) -> ConversationManager:
        return ConversationManager()

    # UNKNOWN should not contain a numbered menu
    def test_unknown_no_menu(self):
        mgr = self._manager()
        db = _mock_db()
        response, intent, _ = mgr.process_message("s1", "asjdflkajsdf random xyz", db)
        assert intent == Intent.UNKNOWN
        assert "1." not in response
        assert "2." not in response
        assert "3." not in response

    # Palkhi contextual follow-up
    @patch("app.agent.tools.get_palkhi_location_tool", return_value="पालखी वाखरीला आहे.")
    def test_palkhi_contextual_followup(self, mock_tool):
        mgr = self._manager()
        db = _mock_db()
        # First turn: ask palkhi location
        mgr.process_message("s2", "पालखी कुठे आहे", db)
        # Second turn: contextual follow-up
        response, intent, _ = mgr.process_message("s2", "पुढे कुठे जाणार", db)
        assert intent == Intent.GET_PALKHI_LOCATION

    # Missing person natural flow
    @patch("app.agent.tools.create_missing_person_report_tool",
           return_value="तक्रार नोंदणी झाली आहे. तिकीट क्रमांक: WV-001")
    def test_missing_person_full_flow(self, mock_tool):
        mgr = self._manager()
        db = _mock_db()
        sid = "s3"

        r1, intent1, _ = mgr.process_message(sid, "माझी मुलगी हरवली आहे", db)
        assert intent1 == Intent.REPORT_MISSING_PERSON
        assert "नाव" in r1  # should ask for name

        r2, _, _ = mgr.process_message(sid, "आकांक्षा", db)
        assert "आकांक्षा" in r2 or "वय" in r2  # should use name and ask age

        r3, _, _ = mgr.process_message(sid, "पाच वर्षे", db)
        assert "कपडे" in r3  # should ask clothing

        r4, _, _ = mgr.process_message(sid, "गुलाबी फ्रॉक", db)
        assert "ठिकाण" in r4 or "कुठे" in r4  # should ask location

        r5, _, _ = mgr.process_message(sid, "सासवडला दिसली होती", db)
        assert "मोबाईल" in r5 or "नंबर" in r5  # should ask contact

        r6, _, _ = mgr.process_message(sid, "9876543210", db)
        assert "बरोबर" in r6 or "माहिती" in r6  # should ask confirmation

        r7, _, _ = mgr.process_message(sid, "हो", db)
        assert "तक्रार" in r7 or "WV-001" in r7  # confirmed

    # Backend unavailable
    @patch("app.agent.tools.get_palkhi_location_tool",
           side_effect=Exception("DB unavailable"))
    def test_backend_unavailable(self, mock_tool):
        mgr = self._manager()
        db = _mock_db()
        response, intent, _ = mgr.process_message("s4", "पालखी कुठे आहे", db)
        assert intent == Intent.GET_PALKHI_LOCATION
        assert response == "सध्या ही माहिती उपलब्ध नाही."


# ===========================================================================
# 4. Fuzzy Matching
# ===========================================================================

class TestFuzzyMatching:

    def test_fuzzy_hospital(self):
        assert fuzzy_contains_keyword("हॉस्पीटल कुठे आहे", "इस्पितळ", threshold=75) or \
               fuzzy_contains_keyword("hospital kuthe ahe", "hospital", threshold=75)

    def test_fuzzy_palkhi(self):
        # After normalization, पलखी → पालखी, so exact will work
        normalized = normalize("पलखी कुठे आहे")
        assert "पालखी" in normalized


# ===========================================================================
# 5. Manual Test Checklist (documented, not automated)
# ===========================================================================

MANUAL_TEST_CHECKLIST = """
Manual Speech Test Checklist — WariVaani Phase 4
=================================================

Start voice CLI:
  cd warivaani/backend
  python -m app.speech.voice_cli

Speak each phrase and verify the response:

1. "पालखी कुठे आहे?"
   Expected: Location from DB, 1–2 sentences in Marathi.

2. "माऊली कुठवर आली?"
   Expected: Same as #1 (normalized → GET_PALKHI_LOCATION).

3. "जवळ डॉक्टर कुठे मिळतील?"
   Expected: Asks for your location OR gives nearest medical from DB.

4. "माझी मुलगी हरवली आहे."
   Expected: "ठीक आहे, मी मदत करतो. तिचं पूर्ण नाव सांगा."

5. "आकांक्षा"
   Expected: "आकांक्षाचं वय किती आहे?"

6. "ती पाच वर्षांची आहे"
   Expected: Asks for clothing description.

7. "गुलाबी फ्रॉक घातला आहे"
   Expected: Asks for last seen location.

8. "सासवडला दिसली होती"
   Expected: Asks for contact number.

After full flow:
  Expected: Confirmation summary then "तक्रार नोंदणी झाली आहे."

Verify latency output after each turn:
  STT latency, Agent latency, TTS first-audio latency, Total.
"""

if __name__ == "__main__":
    print(MANUAL_TEST_CHECKLIST)
