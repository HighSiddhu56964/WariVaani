import sys
sys.stdout.reconfigure(encoding='utf-8')

import time
from fastapi.testclient import TestClient
from app.main import app
from app.services.palkhi_simulator import advance_palkhi_simulator

client = TestClient(app)


def test_websocket_realtime_events():
    print("\n=======================================================")
    print("🚩 Testing Real-Time WebSocket Events & APIs")
    print("=======================================================\n")

    # 1. Connect WebSocket client
    with client.websocket_connect("/ws/events") as ws:
        print("[TEST 1] Connected to WebSocket at /ws/events successfully.")

        # Test PONG ping
        ws.send_text("ping")
        resp = ws.receive_json()
        print(f"  --> Ping response: {resp}")
        assert resp["type"] == "PONG"

        # 2. Trigger Palkhi Simulator movement
        print("\n[TEST 2] Triggering Palkhi Simulator --next for Dnyaneshwar...")
        advance_palkhi_simulator("dnyaneshwar", next_step=True)

        event1 = ws.receive_json()
        print(f"  --> Received Event: {event1['type']}")
        print(f"      Payload: {event1['data']}")
        assert event1["type"] == "PALKHI_LOCATION_UPDATED"
        assert "palkhi_id" in event1["data"]
        assert "current_location" in event1["data"]

        # Reset Palkhi simulator back to Saswad
        advance_palkhi_simulator("dnyaneshwar", set_location="Saswad")
        ws.receive_json()  # consume reset event

        # 3. Trigger Missing Person creation via API
        print("\n[TEST 3] Creating Missing Person report via POST /missing-person...")
        payload = {
            "name": "रामचंद्र शहाणे",
            "age": 62,
            "clothing": "पांढरा कुर्ता आणि धोतर",
            "description": "वाखरी रिंगण मैदानाजवळ हरवले",
            "last_seen_location": "वाखरी",
            "contact": "9876543210"
        }
        res_post = client.post("/missing-person", json=payload)
        assert res_post.status_code == 201
        created_person = res_post.json()
        ticket_id = created_person["ticket_id"]
        print(f"  --> Report Created! Ticket ID: {ticket_id}")

        event2 = ws.receive_json()
        print(f"  --> Received Event: {event2['type']}")
        print(f"      Payload: {event2['data']}")
        assert event2["type"] == "MISSING_PERSON_CREATED"
        assert event2["data"]["ticket_id"] == ticket_id

        # 4. Trigger Missing Person status update via PATCH /missing-person/{ticket_id}/status
        print(f"\n[TEST 4] Updating status for ticket {ticket_id} via PATCH /missing-person/{ticket_id}/status...")
        patch_payload = {"status": "RESOLVED"}
        res_patch = client.patch(f"/missing-person/{ticket_id}/status", json=patch_payload)
        assert res_patch.status_code == 200
        updated_person = res_patch.json()
        print(f"  --> Status Updated! New Status: {updated_person['status']}")

        event3 = ws.receive_json()
        print(f"  --> Received Event: {event3['type']}")
        print(f"      Payload: {event3['data']}")
        assert event3["type"] == "MISSING_PERSON_STATUS_UPDATED"
        assert event3["data"]["ticket_id"] == ticket_id
        assert event3["data"]["status"] == "RESOLVED"

    # 5. Test Demo State endpoint GET /demo/state
    print("\n[TEST 5] Verifying GET /demo/state endpoint...")
    res_demo = client.get("/demo/state")
    assert res_demo.status_code == 200
    demo_state = res_demo.json()
    print("  --> Demo State Response:")
    print(f"      Data Mode           : {demo_state['data_mode']}")
    print(f"      Palkhis Count       : {len(demo_state['palkhis'])}")
    print(f"      Open Missing Persons: {demo_state['open_missing_persons']}")
    print(f"      Medical Facilities  : {demo_state['medical_facilities']}")
    print(f"      Last Updated        : {demo_state['last_updated']}")

    print("\n=======================================================")
    print("🎉 ALL REAL-TIME WEBSOCKET & API TESTS PASSED SUCCESSFULLY!")
    print("=======================================================\n")


if __name__ == "__main__":
    test_websocket_realtime_events()
