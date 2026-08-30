from app.database.connection import SessionLocal
from app.agent.conversation import conversation_manager
from app.models.lost_item import LostItemReport

def test_lost_item_voice_flow():
    db = SessionLocal()
    session_id = "test_voice_session_lost_99"

    print("\n--- TEST: Lost Item Voice Call Simulation ---")

    # Step 1: User reports lost item
    r1, i1, f1 = conversation_manager.process_message(session_id, "माझी बॅग हरवली आहे", db)
    print(f"Call -> User: माझी बॅग हरवली आहे")
    print(f"Agent -> Response: {r1} [Intent: {i1}, Followup: {f1}]")

    # Step 2: User states item type
    r2, i2, f2 = conversation_manager.process_message(session_id, "काळा लेदर वॉलेट", db)
    print(f"Call -> User: काळा लेदर वॉलेट")
    print(f"Agent -> Response: {r2}")

    # Step 3: User states color
    r3, i3, f3 = conversation_manager.process_message(session_id, "काळा", db)
    print(f"Call -> User: काळा")
    print(f"Agent -> Response: {r3}")

    # Step 4: User states location
    r4, i4, f4 = conversation_manager.process_message(session_id, "सासवड मंदिर परिसर", db)
    print(f"Call -> User: सासवड मंदिर परिसर")
    print(f"Agent -> Response: {r4}")

    # Step 5: User provides contact number
    r5, i5, f5 = conversation_manager.process_message(session_id, "9876543210", db)
    print(f"Call -> User: 9876543210")
    print(f"Agent -> Response: {r5}")

    # Step 6: Confirmation
    r6, i6, f6 = conversation_manager.process_message(session_id, "हो, बरोबर आहे", db)
    print(f"Call -> User: हो, बरोबर आहे")
    print(f"Agent -> Response: {r6} [Intent: {i6}, Followup: {f6}]")

    # Verify report in database
    latest_report = db.query(LostItemReport).filter(LostItemReport.source == "VOICE_CALL").order_by(LostItemReport.id.desc()).first()
    print(f"\n[DB VERIFICATION]")
    if latest_report:
        print(f"  Ticket ID: {latest_report.ticket_id}")
        print(f"  Report Type: {latest_report.report_type}")
        print(f"  Item Type: {latest_report.item_type}")
        print(f"  Color: {latest_report.color}")
        print(f"  Location: {latest_report.location}")
        print(f"  Contact: {latest_report.contact_number}")
        print(f"  Status: {latest_report.status}")
        print(f"  Source: {latest_report.source}")
    else:
        print("  ERROR: Report not found in database!")

def test_found_item_voice_flow():
    db = SessionLocal()
    session_id = "test_voice_session_found_88"

    print("\n--- TEST: Found Item Voice Call Simulation ---")

    # Step 1: User reports found item
    r1, i1, f1 = conversation_manager.process_message(session_id, "मला एक मोबाईल फोन सापडला आहे", db)
    print(f"Call -> User: मला एक मोबाईल फोन सापडला आहे")
    print(f"Agent -> Response: {r1}")

    # Step 2: User states item type
    r2, i2, f2 = conversation_manager.process_message(session_id, "सॅमसंग स्मार्टफोन", db)
    print(f"Call -> User: सॅमसंग स्मार्टफोन")
    print(f"Agent -> Response: {r2}")

    # Step 3: User states color
    r3, i3, f3 = conversation_manager.process_message(session_id, "निळा", db)
    print(f"Call -> User: निळा")
    print(f"Agent -> Response: {r3}")

    # Step 4: User states location
    r4, i4, f4 = conversation_manager.process_message(session_id, "जेजुरी पालखी तळावर", db)
    print(f"Call -> User: जेजुरी पालखी तळावर")
    print(f"Agent -> Response: {r4}")

    # Step 5: User provides contact number
    r5, i5, f5 = conversation_manager.process_message(session_id, "9123456789", db)
    print(f"Call -> User: 9123456789")
    print(f"Agent -> Response: {r5}")

    # Step 6: Confirmation
    r6, i6, f6 = conversation_manager.process_message(session_id, "हो", db)
    print(f"Call -> User: हो")
    print(f"Agent -> Response: {r6}")

    # Verify report in database
    latest_report = db.query(LostItemReport).filter(LostItemReport.report_type == "FOUND", LostItemReport.source == "VOICE_CALL").order_by(LostItemReport.id.desc()).first()
    print(f"\n[DB VERIFICATION]")
    if latest_report:
        print(f"  Ticket ID: {latest_report.ticket_id}")
        print(f"  Report Type: {latest_report.report_type}")
        print(f"  Item Type: {latest_report.item_type}")
        print(f"  Color: {latest_report.color}")
        print(f"  Location: {latest_report.location}")
        print(f"  Contact: {latest_report.contact_number}")
        print(f"  Status: {latest_report.status}")
        print(f"  Source: {latest_report.source}")
    else:
        print("  ERROR: Report not found in database!")

if __name__ == "__main__":
    test_lost_item_voice_flow()
    test_found_item_voice_flow()
