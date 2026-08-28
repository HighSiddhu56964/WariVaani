import sys
from app.database.connection import SessionLocal
from app.agent.conversation import conversation_manager


def run_cli():
    session_id = "cli-session-001"
    print("=" * 60)
    print("🚩 WariVaani (वारीवाणी) Marathi Voice/Text Assistance CLI")
    print("Type your message in Marathi (or 'exit' / 'quit' to exit).")
    print("=" * 60)

    db = SessionLocal()
    try:
        while True:
            try:
                user_input = input("\nYou: ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\n\nपुन्हा भेटू! जय हरी विठ्ठल! 🚩")
                break

            if not user_input:
                continue

            if user_input.lower() in ["exit", "quit", "बाहेर"]:
                print("पुन्हा भेटू! जय हरी विठ्ठल! 🚩")
                break

            response_text, intent, requires_followup = conversation_manager.process_message(
                session_id=session_id,
                message=user_input,
                db=db
            )

            print(f"WariVaani: {response_text}")
            if "--debug" in sys.argv:
                print(f"  [Debug Intent: {intent}, Followup: {requires_followup}]")
    finally:
        db.close()


if __name__ == "__main__":
    run_cli()
