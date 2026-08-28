from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.database.connection import get_db
from app.models.missing_person import MissingPerson
from app.models.facility import Facility
from app.models.palkhi import Palkhi, RouteCheckpoint
from app.core.config import settings

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Authority dashboard summary metrics for Person 2's admin UI, supporting both Palkhis.
    """
    open_missing_count = db.scalars(
        select(func.count(MissingPerson.id)).where(MissingPerson.status == "OPEN")
    ).first() or 0

    medical_count = db.scalars(
        select(func.count(Facility.id)).where(Facility.type.ilike("%MEDICAL%"))
    ).first() or 0

    palkhis_list = db.scalars(select(Palkhi).order_by(Palkhi.id)).all()
    palkhi_summaries = []

    for p in palkhis_list:
        curr_loc_name = "Unknown"
        next_cp_name = None
        if p.current_checkpoint_id:
            cp = db.scalars(select(RouteCheckpoint).where(RouteCheckpoint.id == p.current_checkpoint_id)).first()
            if cp:
                curr_loc_name = cp.location_name
                next_cp_name = cp.next_checkpoint

        palkhi_summaries.append({
            "id": p.id,
            "name": p.name,
            "saint_name": p.saint_name,
            "current_location": curr_loc_name,
            "next_checkpoint": next_cp_name,
            "updated_at": p.updated_at.isoformat()
        })

    data_mode = "DEMO" if getattr(settings, "DEMO_MODE", True) else "LIVE"

    return {
        "open_missing_persons": open_missing_count,
        "medical_facilities": medical_count,
        "palkhi_current_location": palkhi_summaries[0]["current_location"] if palkhi_summaries else "Unknown",
        "palkhis": palkhi_summaries,
        "data_mode": data_mode,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
