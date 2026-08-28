from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class MissingPersonCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Full name of the missing person")
    age: int = Field(..., ge=0, le=120, description="Age in years")
    clothing: str = Field(..., min_length=2, max_length=255, description="Description of clothing worn")
    description: Optional[str] = Field(None, description="Additional details, features, or context")
    last_seen_location: str = Field(..., min_length=2, max_length=255, description="Checkpoint or location name where last seen")
    last_seen_time: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc), description="Timestamp when last seen")
    contact: str = Field(..., min_length=5, max_length=100, description="Contact phone number or details of guardian/reporter")


class MissingPersonStatusUpdate(BaseModel):
    status: str = Field(..., description="Status: OPEN, UNDER_REVIEW, RESOLVED")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        upper_status = v.upper().strip()
        allowed = {"OPEN", "UNDER_REVIEW", "RESOLVED"}
        if upper_status not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return upper_status


class MissingPersonResponse(BaseModel):
    id: int
    ticket_id: str
    name: str
    age: int
    clothing: str
    description: Optional[str] = None
    last_seen_location: str
    last_seen_time: datetime
    contact: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
