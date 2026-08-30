import sys
sys.stdout.reconfigure(encoding='utf-8')

from app.database.connection import SessionLocal
from app.agent.conversation import ConversationManager
from app.agent.normalizer import detect_palkhi_entity
from app.agent.intents import PalkhiEntity
from app.agent.response_style import PALKHI_CLARIFICATION
from app.services.palkhi_simulator import advance_palkhi_simulator, print_palkhi_status


def test_entity_normalization():
    print("\n--- 1. Testing Palkhi Entity Normalization & Phonetics ---")
    test_cases = [
        ("ज्ञानेश्वर", PalkhiEntity.DNYANESHWAR),
        ("माऊली", PalkhiEntity.DNYANESHWAR),
        ("माउली", PalkhiEntity.DNYANESHWAR),
        ("ज्ञानोबा", PalkhiEntity.DNYANESHWAR),
        ("dnyaneshwar", PalkhiEntity.DNYANESHWAR),
        ("mauli", PalkhiEntity.DNYANESHWAR),
        ("तुकाराम", PalkhiEntity.TUKARAM),
        ("तुकोबा", PalkhiEntity.TUKARAM),
        ("tukaram", PalkhiEntity.TUKARAM),
        ("tukoba", PalkhiEntity.TUKARAM),
        ("पालखी", None),
    ]

    for text, expected in test_cases:
        detected = detect_palkhi_entity(text)
        status = "PASSED" if detected == expected else f"FAILED (Got {detected})"
        print(f"Text: '{text}' => Expected: {expected} | {status}")
        assert detected == expected, f"Failed normalization for {text}"


def test_voice_agent_disambiguation_flow():
    print("\n--- 2. Testing Voice Agent Disambiguation & Memory Flows ---")
    db = SessionLocal()
    cm = ConversationManager()
    try:
        # Test Case A: Generic query triggers clarification -> User selects Dnyaneshwar
        session_a = "session_test_a"
        reply1, intent1, followup1 = cm.process_message(session_a, "पालखी कुठे आहे?", db)
        print(f"[Case A1] Generic Query: 'पालखी कुठे आहे?'")
        print(f"   Reply: {reply1}")
        assert reply1 == PALKHI_CLARIFICATION, "Should return PALKHI_CLARIFICATION"
        assert followup1 is True, "Followup should be True"

        reply2, intent2, followup2 = cm.process_message(session_a, "ज्ञानोबा माऊली", db)
        print(f"[Case A2] Selection: 'ज्ञानोबा माऊली'")
        print(f"   Reply: {reply2}")
        assert "ज्ञानेश्वर माऊलींची" in reply2 or "ज्ञानेश्वर" in reply2, "Should return Dnyaneshwar location"
        assert followup2 is False, "Followup should be False"

        # Test Case B: Generic query triggers clarification -> User selects Tukaram
        session_b = "session_test_b"
        reply_b1, _, _ = cm.process_message(session_b, "पालखी कुठे आहे?", db)
        assert reply_b1 == PALKHI_CLARIFICATION

        reply_b2, _, _ = cm.process_message(session_b, "तुकाराम महाराजांची", db)
        print(f"[Case B] Selection: 'तुकाराम महाराजांची'")
        print(f"   Reply: {reply_b2}")
        assert "संत तुकाराम महाराजांची" in reply_b2 or "तुकाराम" in reply_b2, "Should return Tukaram location"

        # Test Case C: Specific initial query (Dnyaneshwar)
        session_c = "session_test_c"
        reply_c, _, followup_c = cm.process_message(session_c, "ज्ञानेश्वर माऊलींची पालखी कुठे आहे?", db)
        print(f"[Case C] Specific Query: 'ज्ञानेश्वर माऊलींची पालखी कुठे आहे?'")
        print(f"   Reply: {reply_c}")
        assert reply_c != PALKHI_CLARIFICATION, "Should NOT trigger clarification"
        assert "ज्ञानेश्वर माऊलींची" in reply_c or "ज्ञानेश्वर" in reply_c

        # Test Case D: Context persistence for follow-up questions
        # Following Case C (selected_palkhi is DNYANESHWAR)
        reply_d, _, _ = cm.process_message(session_c, "पुढचा मुक्काम?", db)
        print(f"[Case D] Contextual Followup: 'पुढचा मुक्काम?'")
        print(f"   Reply: {reply_d}")
        assert "ज्ञानेश्वर माऊलींच्या" in reply_d or "ज्ञानेश्वर" in reply_d

        # Test Case E: Palkhi context switching mid-conversation
        reply_e, _, _ = cm.process_message(session_c, "तुकाराम महाराजांची पालखी कुठे आहे?", db)
        print(f"[Case E] Context Switch: 'तुकाराम महाराजांची पालखी कुठे आहे?'")
        print(f"   Reply: {reply_e}")
        assert "संत तुकाराम महाराजांची" in reply_e or "तुकाराम" in reply_e, "Should switch to Tukaram"

        print("\nALL DISAMBIGUATION & MEMORY TESTS PASSED SUCCESSFULLY!")

    finally:
        db.close()


if __name__ == "__main__":
    test_entity_normalization()
    test_voice_agent_disambiguation_flow()
