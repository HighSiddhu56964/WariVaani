from fastapi.testclient import TestClient
from app.main import app
from app.agent.intents import Intent
from app.agent.router import intent_router
from unittest.mock import patch

client = TestClient(app)


def test_intent_routing():
    """Verify deterministic intent classification for Marathi queries."""
    # 1. Palkhi Location Intent
    classify = lambda text: intent_router.classify(text)[0]
    assert classify("पालखी कुठे आहे?") == Intent.GET_PALKHI_LOCATION
    assert classify("माऊली कुठवर आली?") == Intent.GET_PALKHI_LOCATION
    assert classify("ज्ञानोबांची पालखी कुठे आहे?") == Intent.GET_PALKHI_LOCATION

    # 2. Medical Intent
    assert classify("जवळचा मेडिकल कुठे आहे?") == Intent.GET_NEAREST_MEDICAL
    assert classify("वैद्यकीय मदत कुठे मिळेल?") == Intent.GET_NEAREST_MEDICAL
    assert classify("जवळ दवाखाना आहे का?") == Intent.GET_NEAREST_MEDICAL

    # 3. Missing Person Intent
    assert classify("माझा मुलगा हरवला आहे.") == Intent.REPORT_MISSING_PERSON
    assert classify("माझे वडील सापडत नाहीत.") == Intent.REPORT_MISSING_PERSON
    assert classify("व्यक्ती हरवली आहे.") == Intent.REPORT_MISSING_PERSON

    # 4. Unknown Intent
    assert classify("आज हवामान कसे आहे?") == Intent.UNKNOWN


@patch("app.agent.tools.get_palkhi_location_tool", return_value="माऊलींची पालखी सासवडजवळ आहे.")
def test_palkhi_query_endpoint(_tool):
    """Verify POST /agent/message for GET_PALKHI_LOCATION."""
    response = client.post(
        "/agent/message",
        json={"session_id": "test-palkhi-01", "message": "पालखी कुठे आहे?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "GET_PALKHI_LOCATION"
    assert "पालखी" in data["response"] or "माऊली" in data["response"]
    assert data["requires_followup"] is False


@patch("app.agent.tools.create_missing_person_report_tool", return_value="नोंद झाली. तिकीट क्रमांक WR-10002 आहे.")
def test_missing_person_full_conversation_flow(_tool):
    """Verify multi-turn missing person reporting flow, confirmation, and ticket generation."""
    session_id = "test-missing-flow-01"

    # Step 1: Initial trigger
    res1 = client.post("/agent/message", json={"session_id": session_id, "message": "माझा मुलगा हरवला आहे."})
    assert res1.status_code == 200
    assert res1.json()["intent"] == "REPORT_MISSING_PERSON"
    assert "पूर्ण नाव" in res1.json()["response"]
    assert res1.json()["requires_followup"] is True

    # Step 2: Provide Name
    res2 = client.post("/agent/message", json={"session_id": session_id, "message": "सुशांत मोरे"})
    assert res2.status_code == 200
    assert "वय" in res2.json()["response"]

    # Step 3: Provide Age
    res3 = client.post("/agent/message", json={"session_id": session_id, "message": "१० वर्ष"})
    assert res3.status_code == 200
    assert "कपडे" in res3.json()["response"]

    # Step 4: Provide Clothing
    res4 = client.post("/agent/message", json={"session_id": session_id, "message": "पांढरा शर्ट आणि निळी पँट"})
    assert res4.status_code == 200
    assert "कुठे" in res4.json()["response"]

    # Step 5: Provide Last Seen Location
    res5 = client.post("/agent/message", json={"session_id": session_id, "message": "जेजुरी"})
    assert res5.status_code == 200
    assert "मोबाईल नंबर" in res5.json()["response"]

    # Step 6: Provide Contact Number -> Triggers Summary & Confirmation
    res6 = client.post("/agent/message", json={"session_id": session_id, "message": "9876543210"})
    assert res6.status_code == 200
    assert "ही माहिती बरोबर आहे का?" in res6.json()["response"]
    assert res6.json()["requires_followup"] is True

    # Step 7: Affirmative Confirmation -> Ticket Creation
    res7 = client.post("/agent/message", json={"session_id": session_id, "message": "हो बरोबर आहे"})
    assert res7.status_code == 200
    assert "WR-" in res7.json()["response"]
    assert res7.json()["requires_followup"] is False


@patch("app.agent.tools.find_nearest_medical_tool", return_value=("जवळचं वैद्यकीय केंद्र एक किलोमीटरवर आहे.", False))
def test_medical_query_with_checkpoint_followup(_tool):
    """Verify medical query when user specifies checkpoint location."""
    session_id = "test-medical-01"

    # Query with checkpoint in prompt
    res = client.post(
        "/agent/message",
        json={"session_id": session_id, "message": "सासवड जवळ दवाखाना आहे का?"}
    )
    assert res.status_code == 200
    assert res.json()["intent"] == "GET_NEAREST_MEDICAL"
    assert "वैद्यकीय मदत" in res.json()["response"] or "केंद्र" in res.json()["response"]


def test_unknown_intent_endpoint():
    """Verify greeting / help menu for unknown requests."""
    res = client.post(
        "/agent/message",
        json={"session_id": "test-unknown-01", "message": "नमस्ते"}
    )
    assert res.status_code == 200
    assert res.json()["intent"] == "UNKNOWN"
    assert "राम कृष्ण हरी" in res.json()["response"]
