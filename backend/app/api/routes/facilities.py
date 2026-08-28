from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, cast
from geoalchemy2 import Geography
from app.database.connection import get_db
from app.models.facility import Facility
from app.schemas.facility import FacilityResponse

router = APIRouter(prefix="/facilities", tags=["Facilities"])


@router.get("/nearby", response_model=List[FacilityResponse])
def get_nearby_facilities(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude of user/location"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Longitude of user/location"),
    radius_km: float = Query(10.0, gt=0.0, le=100.0, description="Radius in kilometers"),
    type: Optional[str] = Query(None, description="Optional facility type filter (e.g. MEDICAL_CAMP, WATER_STATION, FOOD_STATION, SHELTER, POLICE_HELP_DESK)"),
    db: Session = Depends(get_db)
):
    """
    Find nearby emergency & support facilities along the Wari route ordered by proximity (PostGIS spatial query).
    """
    radius_meters = radius_km * 1000.0

    # User spatial point geometry/geography (SRID 4326: WGS84)
    user_point = func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326)
    user_geog = cast(user_point, Geography)
    facility_geog = cast(Facility.location_geom, Geography)

    # Compute distance in meters using PostGIS geography ST_Distance
    distance_expr = func.ST_Distance(facility_geog, user_geog).label("distance_meters")

    query = select(Facility, distance_expr)

    # Apply PostGIS spatial ST_DWithin filter
    query = query.where(
        func.ST_DWithin(facility_geog, user_geog, radius_meters)
    )

    if type:
        query = query.where(Facility.type.ilike(f"%{type}%"))

    query = query.order_by("distance_meters")

    results = db.execute(query).all()

    facilities_res = []
    for facility, dist_m in results:
        res = FacilityResponse.model_validate(facility)
        res.distance_meters = round(dist_m, 2) if dist_m is not None else None
        facilities_res.append(res)

    return facilities_res
