from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LostItemReportCreate(BaseModel):
    report_type: str = Field(..., description="LOST or FOUND")
    item_type: str = Field(..., description="Type of item e.g. Bag, Wallet, Mobile Phone")
    color: str = Field(..., description="Color of item")
    description: Optional[str] = Field(None, description="Detailed description")
    location: str = Field(..., description="Last seen location for LOST, found location for FOUND")
    contact_number: str = Field(..., description="Contact phone number")
    source: str = Field("VOICE_CALL", description="VOICE_CALL or MOBILE_APP")


class LostItemStatusUpdate(BaseModel):
    status: str = Field(..., description="OPEN, UNDER_REVIEW, RESOLVED, or CLOSED")
    notes: Optional[str] = Field(None, description="Optional closure / investigation notes")


class LostItemReportResponse(BaseModel):
    id: int
    ticket_id: str
    report_type: str
    item_type: str
    color: str
    description: Optional[str] = None
    location: str
    contact_number: str
    source: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
