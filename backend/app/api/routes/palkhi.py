from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.database.connection import get_db
from app.models.palkhi import Palkhi, RouteCheckpoint
from app.schemas.palkhi import (
    PalkhiDetailResponse,
    PalkhiCurrentDetailResponse,
    RouteCheckpointResponse,
    PalkhiCurrentResponse,
    PalkhiResponse,
    PalkhiLocationResponse
)

router = APIRouter(tags=["Palkhi Tracker"])


def get_palkhi_or_404(palkhi_id: int, db: Session) -> Palkhi:
    palkhi = db.scalars(select(Palkhi).where(Palkhi.id == palkhi_id)).first()
    if not palkhi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Palkhi with ID '{palkhi_id}' not found."
        )
    return palkhi


def get_current_cp(palkhi: Palkhi, db: Session) -> Optional[RouteCheckpoint]:
    if palkhi.current_checkpoint_id:
        cp = db.scalars(select(RouteCheckpoint).where(RouteCheckpoint.id == palkhi.current_checkpoint_id)).first()
        if cp:
            return cp
    # Fallback to earliest checkpoint
    return db.scalars(
        select(RouteCheckpoint)
        .where(RouteCheckpoint.palkhi_id == palkhi.id)
        .order_by(RouteCheckpoint.sequence_number)
    ).first()


@router.get("/palkhis", response_model=List[PalkhiDetailResponse])
def get_all_palkhis(db: Session = Depends(get_db)):
    """
    List all active Palkhis in WariVaani (Sant Dnyaneshwar Maharaj Palkhi & Sant Tukaram Maharaj Palkhi).
    """
    return db.scalars(select(Palkhi).order_by(Palkhi.id)).all()


@router.get("/palkhis/{palkhi_id}", response_model=PalkhiDetailResponse)
def get_palkhi_by_id(palkhi_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information for a specific Palkhi by ID.
    """
    return get_palkhi_or_404(palkhi_id, db)


@router.get("/palkhis/{palkhi_id}/route", response_model=List[RouteCheckpointResponse])
def get_palkhi_full_route(palkhi_id: int, db: Session = Depends(get_db)):
    """
    Get the complete sequence of route checkpoints for a Palkhi (used by Leaflet map rendering).
    """
    palkhi = get_palkhi_or_404(palkhi_id, db)
    return db.scalars(
        select(RouteCheckpoint)
        .where(RouteCheckpoint.palkhi_id == palkhi.id)
        .order_by(RouteCheckpoint.sequence_number)
    ).all()


@router.get("/palkhis/{palkhi_id}/current", response_model=PalkhiCurrentDetailResponse)
def get_palkhi_current(palkhi_id: int, db: Session = Depends(get_db)):
    """
    Get current real-time / simulated position of a specific Palkhi.
    """
    palkhi = get_palkhi_or_404(palkhi_id, db)
    current_cp = get_current_cp(palkhi, db)

    if not current_cp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No checkpoints found for Palkhi '{palkhi.name}'."
        )

    return PalkhiCurrentDetailResponse(
        palkhi_id=palkhi.id,
        palkhi=palkhi.name,
        saint_name=palkhi.saint_name,
        current_checkpoint=current_cp.location_name,
        next_checkpoint=current_cp.next_checkpoint,
        sequence_number=current_cp.sequence_number,
        latitude=current_cp.latitude,
        longitude=current_cp.longitude,
        halt_type=current_cp.halt_type,
        notes=current_cp.notes,
        is_ringan=current_cp.is_ringan,
        ringan_type=current_cp.ringan_type,
        data_mode="DEMO",
        source_year=current_cp.source_year,
        updated_at=palkhi.updated_at
    )


@router.get("/palkhis/{palkhi_id}/next-halt", response_model=RouteCheckpointResponse)
def get_palkhi_next_halt(palkhi_id: int, db: Session = Depends(get_db)):
    """
    Get the next planned halt/stay checkpoint for a Palkhi.
    """
    palkhi = get_palkhi_or_404(palkhi_id, db)
    current_cp = get_current_cp(palkhi, db)

    next_cp = db.scalars(
        select(RouteCheckpoint)
        .where(
            RouteCheckpoint.palkhi_id == palkhi.id,
            RouteCheckpoint.sequence_number > (current_cp.sequence_number if current_cp else 0)
        )
        .order_by(RouteCheckpoint.sequence_number)
    ).first()

    if not next_cp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No further upcoming halts found for Palkhi '{palkhi.name}'."
        )

    return next_cp


@router.get("/palkhis/{palkhi_id}/remaining-route", response_model=List[RouteCheckpointResponse])
def get_palkhi_remaining_route(palkhi_id: int, db: Session = Depends(get_db)):
    """
    Get all remaining upcoming checkpoints from current location onwards to Pandharpur.
    """
    palkhi = get_palkhi_or_404(palkhi_id, db)
    current_cp = get_current_cp(palkhi, db)

    current_seq = current_cp.sequence_number if current_cp else 0

    return db.scalars(
        select(RouteCheckpoint)
        .where(
            RouteCheckpoint.palkhi_id == palkhi.id,
            RouteCheckpoint.sequence_number >= current_seq
        )
        .order_by(RouteCheckpoint.sequence_number)
    ).all()


@router.get("/palkhis/{palkhi_id}/next-ringan", response_model=RouteCheckpointResponse)
def get_palkhi_next_ringan(palkhi_id: int, db: Session = Depends(get_db)):
    """
    Get the next upcoming Ringan ceremony location for a Palkhi.
    """
    palkhi = get_palkhi_or_404(palkhi_id, db)
    current_cp = get_current_cp(palkhi, db)

    current_seq = current_cp.sequence_number if current_cp else 0

    ringan_cp = db.scalars(
        select(RouteCheckpoint)
        .where(
            RouteCheckpoint.palkhi_id == palkhi.id,
            RouteCheckpoint.sequence_number >= current_seq,
            RouteCheckpoint.is_ringan == True
        )
        .order_by(RouteCheckpoint.sequence_number)
    ).first()

    if not ringan_cp:
        # Fallback to any Ringan in the route
        ringan_cp = db.scalars(
            select(RouteCheckpoint)
            .where(
                RouteCheckpoint.palkhi_id == palkhi.id,
                RouteCheckpoint.is_ringan == True
            )
            .order_by(RouteCheckpoint.sequence_number)
        ).first()

    if not ringan_cp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No Ringan checkpoint found for Palkhi '{palkhi.name}'."
        )

    return ringan_cp


# Backward compatibility endpoint
@router.get("/palkhi/current", response_model=PalkhiCurrentResponse)
def get_current_palkhi_location_legacy(db: Session = Depends(get_db)):
    """
    Legacy endpoint for default Dnyaneshwar Palkhi current location.
    """
    palkhi = db.scalars(select(Palkhi).where(Palkhi.name.ilike("%Dnyaneshwar%"))).first()
    if not palkhi:
        palkhi = db.scalars(select(Palkhi)).first()

    if not palkhi:
        raise HTTPException(status_code=404, detail="No Palkhi found.")

    current_cp = get_current_cp(palkhi, db)

    return PalkhiCurrentResponse(
        palkhi=PalkhiResponse.model_validate(palkhi),
        current_location=PalkhiLocationResponse.model_validate(current_cp) if current_cp else None
    )
