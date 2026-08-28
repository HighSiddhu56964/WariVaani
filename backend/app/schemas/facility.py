from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class FacilityResponse(BaseModel):
    id: int
    name: str
    type: str
    latitude: float
    longitude: float
    landmark: Optional[str] = None
    status: str
    source: str
    source_url: Optional[str] = None
    verified_at: Optional[datetime] = None
    distance_meters: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
