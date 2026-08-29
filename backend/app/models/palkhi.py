from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Float, DateTime, ForeignKey, Integer, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.database.base import Base


class Palkhi(Base):
    __tablename__ = "palkhi"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    saint_name: Mapped[str] = mapped_column(String(255), nullable=False)
    route_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source: Mapped[str] = mapped_column(String(100), default="GOVERNMENT_REFERENCE", nullable=False)
    source_year: Mapped[int] = mapped_column(Integer, default=2025, nullable=False)
    data_type: Mapped[str] = mapped_column(String(100), default="REFERENCE_2025", nullable=False)
    current_checkpoint_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    current_latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    current_longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    checkpoints: Mapped[List["RouteCheckpoint"]] = relationship(
        "RouteCheckpoint",
        back_populates="palkhi",
        cascade="all, delete-orphan",
        order_by="RouteCheckpoint.sequence_number"
    )
    locations: Mapped[List["RouteCheckpoint"]] = relationship(
        "RouteCheckpoint",
        back_populates="palkhi",
        cascade="all, delete-orphan",
        overlaps="checkpoints"
    )


class RouteCheckpoint(Base):
    __tablename__ = "palkhi_location"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    palkhi_id: Mapped[int] = mapped_column(ForeignKey("palkhi.id", ondelete="CASCADE"), nullable=False, index=True)
    sequence_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False, index=True)
    location_name: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    next_checkpoint: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    arrival_date_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    departure_date_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    halt_type: Mapped[str] = mapped_column(String(50), default="HALT", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_ringan: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ringan_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    source_year: Mapped[int] = mapped_column(Integer, default=2025, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    data_type: Mapped[str] = mapped_column(String(50), default="REFERENCE_2025", nullable=False)

    # Optional WKT Point string / location representation
    location_geom: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    palkhi: Mapped["Palkhi"] = relationship("Palkhi", back_populates="checkpoints", overlaps="locations")

    @property
    def name(self) -> str:
        return self.location_name


# Alias for backward compatibility
PalkhiLocation = RouteCheckpoint
