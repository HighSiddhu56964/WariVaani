from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base


class LostItemReport(Base):
    __tablename__ = "lost_item_reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    ticket_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    report_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # LOST or FOUND
    item_type: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_number: Mapped[str] = mapped_column(String(100), nullable=False)
    source: Mapped[str] = mapped_column(String(50), default="VOICE_CALL", nullable=False)  # VOICE_CALL, MOBILE_APP
    status: Mapped[str] = mapped_column(String(50), default="OPEN", nullable=False, index=True)  # OPEN, UNDER_REVIEW, RESOLVED, CLOSED
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
