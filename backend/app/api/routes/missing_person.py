from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.database.connection import get_db
from app.models.missing_person import MissingPerson
from app.schemas.missing_person import (
    MissingPersonCreate,
    MissingPersonStatusUpdate,
    MissingPersonResponse
)
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/missing-person", tags=["Missing Person Assistance"])


def generate_ticket_id(db: Session) -> str:
    """Generate sequential ticket ID formatted like WR-10001."""
    last_person = db.scalars(
        select(MissingPerson).order_by(desc(MissingPerson.id))
    ).first()

    if last_person and last_person.ticket_id and last_person.ticket_id.startswith("WR-"):
        try:
            last_num = int(last_person.ticket_id.split("-")[1])
            next_num = last_num + 1
        except (IndexError, ValueError):
            next_num = 10001
    else:
        next_num = 10001

    return f"WR-{next_num:05d}"


@router.post("", response_model=MissingPersonResponse, status_code=status.HTTP_201_CREATED)
def create_missing_person_report(
    payload: MissingPersonCreate,
    db: Session = Depends(get_db)
):
    """
    Register a missing person report during Wari and issue a tracking Ticket ID.
    """
    ticket_id = generate_ticket_id(db)

    db_missing_person = MissingPerson(
        ticket_id=ticket_id,
        name=payload.name,
        age=payload.age,
        clothing=payload.clothing,
        description=payload.description,
        last_seen_location=payload.last_seen_location,
        last_seen_time=payload.last_seen_time or datetime.now(timezone.utc),
        contact=payload.contact,
        source=payload.source or "MOBILE_APP",
        status="OPEN"
    )

    db.add(db_missing_person)
    db.commit()
    db.refresh(db_missing_person)

    # Broadcast MISSING_PERSON_CREATED event over WebSocket
    event_data = {
        "ticket_id": db_missing_person.ticket_id,
        "name": db_missing_person.name,
        "age": db_missing_person.age,
        "clothing": db_missing_person.clothing,
        "description": db_missing_person.description,
        "last_seen_location": db_missing_person.last_seen_location,
        "contact": db_missing_person.contact,
        "source": db_missing_person.source,
        "status": db_missing_person.status,
        "created_at": db_missing_person.created_at.isoformat()
    }
    ws_manager.broadcast_sync("MISSING_PERSON_CREATED", event_data)

    return MissingPersonResponse.model_validate(db_missing_person)


@router.get("", response_model=List[MissingPersonResponse])
def get_missing_persons(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: OPEN, UNDER_REVIEW, RESOLVED"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieve missing person reports with optional status filtering.
    """
    query = select(MissingPerson)

    if status_filter:
        query = query.where(MissingPerson.status.ilike(status_filter))

    query = query.order_by(desc(MissingPerson.created_at)).offset(offset).limit(limit)

    results = db.scalars(query).all()
    return [MissingPersonResponse.model_validate(p) for p in results]


@router.get("/{ticket_id}", response_model=MissingPersonResponse)
def get_missing_person_by_ticket(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    """
    Get missing person details by ticket ID (e.g. WR-10001).
    """
    person = db.scalars(
        select(MissingPerson).where(MissingPerson.ticket_id == ticket_id)
    ).first()

    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Missing person ticket '{ticket_id}' not found."
        )

    return MissingPersonResponse.model_validate(person)


@router.patch("/{ticket_id}/status", response_model=MissingPersonResponse)
def update_missing_person_status(
    ticket_id: str,
    payload: MissingPersonStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update status of a missing person ticket (OPEN, UNDER_REVIEW, RESOLVED).
    Broadcasts MISSING_PERSON_STATUS_UPDATED WebSocket event.
    """
    person = db.scalars(
        select(MissingPerson).where(MissingPerson.ticket_id == ticket_id)
    ).first()

    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Missing person ticket '{ticket_id}' not found."
        )

    person.status = payload.status
    db.commit()
    db.refresh(person)

    # Broadcast MISSING_PERSON_STATUS_UPDATED event over WebSocket
    event_data = {
        "ticket_id": person.ticket_id,
        "name": person.name,
        "status": person.status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    ws_manager.broadcast_sync("MISSING_PERSON_STATUS_UPDATED", event_data)

    return MissingPersonResponse.model_validate(person)
