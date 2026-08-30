from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.database.connection import get_db
from app.models.palkhi import Palkhi, RouteCheckpoint
from app.models.missing_person import MissingPerson
from app.models.facility import Facility
from app.core.config import settings

router = APIRouter(prefix="/demo", tags=["Demo State"])


@router.get("/state")
def get_demo_state(db: Session = Depends(get_db)):
    """
    Get full system state snapshot for frontend debugging and hackathon demo verification.
    """
    open_missing_count = db.scalars(
        select(func.count(MissingPerson.id)).where(MissingPerson.status == "OPEN")
    ).first() or 0

    medical_count = db.scalars(
        select(func.count(Facility.id)).where(Facility.type.ilike("%MEDICAL%"))
    ).first() or 0

    palkhi_list = db.scalars(select(Palkhi).order_by(Palkhi.id)).all()
    palkhi_details = []

    for p in palkhi_list:
        curr_loc_name = "Unknown"
        next_cp_name = None
        seq_num = 0
        lat = p.current_latitude or 0.0
        lon = p.current_longitude or 0.0

        if p.current_checkpoint_id:
            cp = db.scalars(select(RouteCheckpoint).where(RouteCheckpoint.id == p.current_checkpoint_id)).first()
            if cp:
                curr_loc_name = cp.location_name
                next_cp_name = cp.next_checkpoint
                seq_num = cp.sequence_number
                lat = cp.latitude
                lon = cp.longitude

        palkhi_details.append({
            "id": p.id,
            "name": p.name,
            "saint_name": p.saint_name,
            "route_name": p.route_name,
            "current_location": curr_loc_name,
            "latitude": lat,
            "longitude": lon,
            "sequence_number": seq_num,
            "next_checkpoint": next_cp_name,
            "updated_at": p.updated_at.isoformat()
        })

    data_mode = "DEMO" if getattr(settings, "DEMO_MODE", True) else "LIVE"

    return {
        "data_mode": data_mode,
        "palkhis": palkhi_details,
        "open_missing_persons": open_missing_count,
        "medical_facilities": medical_count,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }


@router.post("/reset")
def post_reset_demo():
    """
    Cleanly reset database state and re-seed clean default demo data.
    """
    from app.demo import reset_demo
    return reset_demo()


@router.get("/verify")
def get_verify_demo():
    """
    Verify and return all currently registered missing persons.
    """
    from app.demo import verify_missing_persons
    return verify_missing_persons()
