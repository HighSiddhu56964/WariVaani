from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.agent.conversation import conversation_manager

router = APIRouter(prefix="/agent", tags=["WariVaani Agent"])


class AgentMessageRequest(BaseModel):
    session_id: str = Field(..., min_length=1, description="Session ID for tracking conversation state")
    message: str = Field(..., min_length=1, description="Marathi text message from user")


class AgentMessageResponse(BaseModel):
    session_id: str
    intent: str
    response: str
    requires_followup: bool


@router.post("/message", response_model=AgentMessageResponse)
def handle_agent_message(
    payload: AgentMessageRequest,
    db: Session = Depends(get_db)
):
    """
    Process incoming Marathi text message from user, manage conversation state, and execute tools.
    """
    response_text, intent, requires_followup = conversation_manager.process_message(
        session_id=payload.session_id,
        message=payload.message,
        db=db
    )

    return AgentMessageResponse(
        session_id=payload.session_id,
        intent=intent.value if hasattr(intent, "value") else str(intent),
        response=response_text,
        requires_followup=requires_followup
    )
