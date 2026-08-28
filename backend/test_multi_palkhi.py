import sys
sys.stdout.reconfigure(encoding='utf-8')

from app.database.connection import SessionLocal
from app.agent.conversation import conversation_manager
from app.services.palkhi_simulator import advance_palkhi_simulator, print_palkhi_status
from app.models.palkhi import Palkhi, RouteCheckpoint


def test_voice_agent_multi_palkhi():
    print("\n--- 1. Testing Voice Agent Multi-Palkhi Queries ---")
    db = SessionLocal()
    try:
        session_id = "test_multi_palkhi_user_123"

        queries = [
            ("ज्ञानेश्वर महाराजांची पालखी कुठे आहे?", "Dnyaneshwar Location"),
            ("तुकाराम महाराजांची पालखी कुठे आहे?", "Tukaram Location"),
            ("पुढचा मुक्काम कुठे आहे?", "Next Halt for selected (Tukaram)"),
            ("पुढचं रिंगण कुठे आहे?", "Next Ringan"),
            ("आणखी किती मुक्काम आहेत?", "Remaining Route Stops"),
            ("माऊलींची पालखी", "Switch to Dnyaneshwar"),
            ("पुढचा मुक्काम कुठे आहे?", "Next Halt for Dnyaneshwar"),
        ]

        for q, desc in queries:
            reply, intent, followup = conversation_manager.process_message(session_id, q, db)
            print(f"Query: [{q}] ({desc})")
            print(f"  --> Intent: {intent}")
            print(f"  --> Reply:  {reply}")
            print(f"  --> Followup Required: {followup}\n")

    finally:
        db.close()


def test_voice_agent_palkhi_selection_prompt():
    print("\n--- 2. Testing Voice Agent Palkhi Disambiguation Prompt ---")
    db = SessionLocal()
    try:
        session_id = "test_ambiguous_user_456"

        # Ambiguous query with no session context
        q1 = "पालखी कुठे आहे?"
        reply1, intent1, followup1 = conversation_manager.process_message(session_id, q1, db)
        print(f"Query 1: [{q1}]")
        print(f"  --> Reply:  {reply1}")
        print(f"  --> Followup Required: {followup1}\n")

        # User selects Dnyaneshwar
        q2 = "ज्ञानोबा माऊली"
        reply2, intent2, followup2 = conversation_manager.process_message(session_id, q2, db)
        print(f"Query 2: [{q2}]")
        print(f"  --> Reply:  {reply2}")
        print(f"  --> Followup Required: {followup2}\n")

    finally:
        db.close()


def test_simulator():
    print("\n--- 3. Testing Palkhi GPS Simulator ---")
    print_palkhi_status()

    print("[SIMULATING] Moving Dnyaneshwar Palkhi to next checkpoint...")
    advance_palkhi_simulator(palkhi_query="dnyaneshwar", next_step=True)

    print("[SIMULATING] Resetting Dnyaneshwar Palkhi back to Saswad...")
    advance_palkhi_simulator(palkhi_query="dnyaneshwar", set_location="Saswad")


if __name__ == "__main__":
    test_voice_agent_multi_palkhi()
    test_voice_agent_palkhi_selection_prompt()
    test_simulator()
