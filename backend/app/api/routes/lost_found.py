from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.database.connection import get_db
from app.models.lost_item import LostItemReport
from app.schemas.lost_item import (
    LostItemReportCreate,
    LostItemStatusUpdate,
    LostItemReportResponse
)
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/lost-found", tags=["Lost & Found Assistance"])


def generate_lost_found_ticket_id(db: Session, report_type: str) -> str:
    """Generate sequential ticket ID formatted like LI-10001 (for LOST) or FI-10001 (for FOUND)."""
    prefix = "FI" if report_type.upper() == "FOUND" else "LI"
    
    last_item = db.scalars(
        select(LostItemReport)
        .where(LostItemReport.report_type == report_type.upper())
        .order_by(desc(LostItemReport.id))
    ).first()

    if last_item and last_item.ticket_id and last_item.ticket_id.startswith(f"{prefix}-"):
        try:
            last_num = int(last_item.ticket_id.split("-")[1])
            next_num = last_num + 1
        except (IndexError, ValueError):
            next_num = 10001
    else:
        next_num = 10001

    return f"{prefix}-{next_num:05d}"


@router.post("", response_model=LostItemReportResponse, status_code=status.HTTP_201_CREATED)
def create_lost_found_report(
    payload: LostItemReportCreate,
    db: Session = Depends(get_db)
):
    """
    Register a Lost or Found item report during Wari and issue a tracking Ticket ID.
    Broadcasts LOST_FOUND_CREATED WebSocket event.
    """
    report_type = payload.report_type.upper()
    if report_type not in ["LOST", "FOUND"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="report_type must be either 'LOST' or 'FOUND'"
        )

    ticket_id = generate_lost_found_ticket_id(db, report_type)

    db_item = LostItemReport(
        ticket_id=ticket_id,
        report_type=report_type,
        item_type=payload.item_type,
        color=payload.color,
        description=payload.description,
        location=payload.location,
        contact_number=payload.contact_number,
        source=payload.source or "VOICE_CALL",
        status="OPEN"
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    # Broadcast LOST_FOUND_CREATED event over WebSocket
    event_data = {
        "ticket_id": db_item.ticket_id,
        "report_type": db_item.report_type,
        "item_type": db_item.item_type,
        "color": db_item.color,
        "description": db_item.description,
        "location": db_item.location,
        "contact_number": db_item.contact_number,
        "source": db_item.source,
        "status": db_item.status,
        "created_at": db_item.created_at.isoformat()
    }
    ws_manager.broadcast_sync("LOST_FOUND_CREATED", event_data)

    return LostItemReportResponse.model_validate(db_item)


@router.get("", response_model=List[LostItemReportResponse])
def get_lost_found_reports(
    report_type: Optional[str] = Query(None, description="Filter by report type: LOST or FOUND"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: OPEN, UNDER_REVIEW, RESOLVED, CLOSED"),
    source_filter: Optional[str] = Query(None, alias="source", description="Filter by source: VOICE_CALL or MOBILE_APP"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieve Lost & Found reports with optional filters.
    """
    query = select(LostItemReport)

    if report_type:
        query = query.where(LostItemReport.report_type == report_type.upper())
    if status_filter:
        query = query.where(LostItemReport.status.ilike(status_filter))
    if source_filter:
        query = query.where(LostItemReport.source.ilike(source_filter))

    query = query.order_by(desc(LostItemReport.created_at)).offset(offset).limit(limit)

    results = db.scalars(query).all()
    return [LostItemReportResponse.model_validate(r) for r in results]


@router.get("/{ticket_id}", response_model=LostItemReportResponse)
def get_lost_found_report_by_ticket(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    """
    Get details of a Lost or Found item report by ticket ID (e.g. LI-10001, FI-10001).
    """
    item = db.scalars(
        select(LostItemReport).where(LostItemReport.ticket_id == ticket_id)
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lost/Found report ticket '{ticket_id}' not found."
        )

    return LostItemReportResponse.model_validate(item)


@router.patch("/{ticket_id}/status", response_model=LostItemReportResponse)
def update_lost_found_status(
    ticket_id: str,
    payload: LostItemStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update status of a Lost/Found report (OPEN, UNDER_REVIEW, RESOLVED, CLOSED).
    Broadcasts LOST_FOUND_STATUS_UPDATED WebSocket event.
    """
    item = db.scalars(
        select(LostItemReport).where(LostItemReport.ticket_id == ticket_id)
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lost/Found report ticket '{ticket_id}' not found."
        )

    item.status = payload.status.upper()
    db.commit()
    db.refresh(item)

    # Broadcast LOST_FOUND_STATUS_UPDATED event over WebSocket
    event_data = {
        "ticket_id": item.ticket_id,
        "report_type": item.report_type,
        "item_type": item.item_type,
        "status": item.status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    ws_manager.broadcast_sync("LOST_FOUND_STATUS_UPDATED", event_data)

    return LostItemReportResponse.model_validate(item)
