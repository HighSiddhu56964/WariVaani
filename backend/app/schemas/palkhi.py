from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class RouteCheckpointResponse(BaseModel):
    id: int
    palkhi_id: int
    sequence_number: int
    name: str = Field(..., alias="location_name")
    location_name: str
    latitude: float
    longitude: float
    next_checkpoint: Optional[str] = None
    arrival_date_reference: Optional[str] = None
    departure_date_reference: Optional[str] = None
    halt_type: str
    notes: Optional[str] = None
    is_ringan: bool = False
    ringan_type: Optional[str] = None
    source_year: int = 2025
    data_type: str = "REFERENCE_2025"
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PalkhiDetailResponse(BaseModel):
    id: int
    name: str
    saint_name: str
    route_name: Optional[str] = None
    source: str
    source_year: int = 2025
    data_type: str = "REFERENCE_2025"
    current_checkpoint_id: Optional[int] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    updated_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PalkhiCurrentDetailResponse(BaseModel):
    palkhi_id: int
    palkhi: str
    saint_name: str
    current_checkpoint: str
    next_checkpoint: Optional[str] = None
    sequence_number: int
    latitude: float
    longitude: float
    halt_type: str
    notes: Optional[str] = None
    is_ringan: bool = False
    ringan_type: Optional[str] = None
    data_mode: str = "DEMO"
    source_year: int = 2025
    updated_at: datetime


class PalkhiLocationResponse(RouteCheckpointResponse):
    pass


class PalkhiResponse(PalkhiDetailResponse):
    pass


class PalkhiCurrentResponse(BaseModel):
    palkhi: PalkhiResponse
    current_location: Optional[PalkhiLocationResponse] = None

    model_config = ConfigDict(from_attributes=True)
