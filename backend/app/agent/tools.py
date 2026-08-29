from typing import Tuple, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, func, cast
from geoalchemy2 import Geography

from app.models.palkhi import Palkhi, RouteCheckpoint
from app.models.facility import Facility
from app.models.missing_person import MissingPerson
from app.api.routes.missing_person import generate_ticket_id
from app.services.websocket_manager import ws_manager


# Predefined checkpoint mapping for demo text location resolution
DEMO_CHECKPOINTS = {
    "आळंदी": (18.6775, 73.8967),
    "alandi": (18.6775, 73.8967),
    "देहू": (18.7208, 73.7711),
    "dehu": (18.7208, 73.7711),
    "आकुर्डी": (18.6494, 73.7806),
    "akurdi": (18.6494, 73.7806),
    "पुणे": (18.5204, 73.8567),
    "pune": (18.5204, 73.8567),
    "हडपसर": (18.5089, 73.9259),
    "hadapsar": (18.5089, 73.9259),
    "लोणी काळभोर": (18.4878, 74.0202),
    "loni kalbhor": (18.4878, 74.0202),
    "लोणी": (18.4878, 74.0202),
    "loni": (18.4878, 74.0202),
    "यवत": (18.4651, 74.2085),
    "yavat": (18.4651, 74.2085),
    "वरवंड": (18.3995, 74.3411),
    "varvand": (18.3995, 74.3411),
    "सासवड": (18.3444, 74.0305),
    "saswad": (18.3444, 74.0305),
    "जेजुरी": (18.2741, 74.1565),
    "jejuri": (18.2741, 74.1565),
    "वाल्हे": (18.1793, 74.2057),
    "walhe": (18.1793, 74.2057),
    "बारामती": (18.1517, 74.5771),
    "baramati": (18.1517, 74.5771),
    "लोणंद": (18.0416, 74.1866),
    "lonand": (18.0416, 74.1866),
    "तरडगाव": (17.9944, 74.2411),
    "tardgaon": (17.9944, 74.2411),
    "इंदापूर": (17.9644, 74.8010),
    "indapur": (17.9644, 74.8010),
    "अकलूज": (17.8860, 75.0210),
    "akluj": (17.8860, 75.0210),
    "माळशिरस": (17.8344, 74.8021),
    "malshiras": (17.8344, 74.8021),
    "वेळापूर": (17.7850, 75.0210),
    "velapur": (17.7850, 75.0210),
    "वाखरी": (17.6980, 75.2850),
    "vakhri": (17.6980, 75.2850),
    "पंढरपूर": (17.6773, 75.3239),
    "pandharpur": (17.6773, 75.3239),
}


def get_palkhi_location_tool(db: Session, palkhi_id: Optional[int] = None) -> str:
    """Fetch current Palkhi location from database and return Marathi response."""
    if palkhi_id:
        palkhi = db.scalars(select(Palkhi).where(Palkhi.id == palkhi_id)).first()
    else:
        palkhi = db.scalars(select(Palkhi).where(Palkhi.name.ilike("%Sant Dnyaneshwar%"))).first()

    if not palkhi:
        palkhi = db.scalars(select(Palkhi)).first()

    if not palkhi:
        return "माफ करा, पालखीच्या स्थानाची माहिती सध्या उपलब्ध नाही."

    current_cp = None
    if palkhi.current_checkpoint_id:
        current_cp = db.scalars(select(RouteCheckpoint).where(RouteCheckpoint.id == palkhi.current_checkpoint_id)).first()

    if not current_cp:
        current_cp = db.scalars(
            select(RouteCheckpoint)
            .where(RouteCheckpoint.palkhi_id == palkhi.id)
            .order_by(RouteCheckpoint.sequence_number)
        ).first()

    if not current_cp:
        return f"{palkhi.saint_name} पालखीचे स्थान उपलब्ध नाही."

    next_info = (
        f" पुढचा नियोजित थांबा {current_cp.next_checkpoint} आहे."
        if current_cp.next_checkpoint
        else " पालखी पंढरपूर येथे पोहोचली आहे."
    )

    prefix = "तुकोबांची" if "Tukaram" in palkhi.name else "माऊलींची"
    return f"{prefix} पालखी सध्या {current_cp.location_name}जवळ आहे.{next_info}"


def get_next_halt_tool(db: Session, palkhi_id: Optional[int] = None) -> str:
    """Fetch next planned halt/checkpoint for Palkhi from database and return Marathi response."""
    if palkhi_id:
        palkhi = db.scalars(select(Palkhi).where(Palkhi.id == palkhi_id)).first()
    else:
        palkhi = db.scalars(select(Palkhi).where(Palkhi.name.ilike("%Sant Dnyaneshwar%"))).first()

    if not palkhi:
        palkhi = db.scalars(select(Palkhi)).first()

    if not palkhi:
        return "माफ करा, पालखीच्या पुढच्या मुक्कामाची माहिती सध्या उपलब्ध नाही."

    current_cp = None
    if palkhi.current_checkpoint_id:
        current_cp = db.scalars(select(RouteCheckpoint).where(RouteCheckpoint.id == palkhi.current_checkpoint_id)).first()

    if not current_cp:
        current_cp = db.scalars(
            select(RouteCheckpoint)
            .where(RouteCheckpoint.palkhi_id == palkhi.id)
            .order_by(RouteCheckpoint.sequence_number)
        ).first()

    if not current_cp or not current_cp.next_checkpoint:
        return f"{palkhi.saint_name} पालखी पंढरपूर येथे पोहोचली आहे."

    prefix = "तुकोबांच्या" if "Tukaram" in palkhi.name else "माऊलींच्या"
    return f"{prefix} पालखीचा पुढचा नियोजित मुक्काम {current_cp.next_checkpoint} आहे."


def get_next_ringan_tool(db: Session, palkhi_id: Optional[int] = None) -> str:
    """Fetch next Ringan location for Palkhi from database and return Marathi response."""
    if palkhi_id:
        palkhi = db.scalars(select(Palkhi).where(Palkhi.id == palkhi_id)).first()
    else:
        palkhi = db.scalars(select(Palkhi).where(Palkhi.name.ilike("%Sant Dnyaneshwar%"))).first()

    if not palkhi:
        palkhi = db.scalars(select(Palkhi)).first()

    if not palkhi:
        return "माफ करा, रिंगणाची माहिती सध्या उपलब्ध नाही."

    current_seq = 0
    if palkhi.current_checkpoint_id:
        current_cp = db.scalars(select(RouteCheckpoint).where(RouteCheckpoint.id == palkhi.current_checkpoint_id)).first()
        if current_cp:
            current_seq = current_cp.sequence_number

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
        ringan_cp = db.scalars(
            select(RouteCheckpoint)
            .where(
                RouteCheckpoint.palkhi_id == palkhi.id,
                RouteCheckpoint.is_ringan == True
            )
            .order_by(RouteCheckpoint.sequence_number)
        ).first()

    if not ringan_cp:
        return f"{palkhi.saint_name} पालखीच्या मार्गावर पुढचे रिंगण उपलब्ध नाही."

    prefix = "तुकोबांच्या" if "Tukaram" in palkhi.name else "ज्ञानोबा माऊलींचे"
    notes_str = f" ({ringan_cp.notes})" if ringan_cp.notes else ""
    return f"{prefix} पुढचे रिंगण {ringan_cp.location_name}{notes_str} येथे होणार आहे."


def get_palkhi_route_summary_tool(db: Session, palkhi_id: Optional[int] = None) -> str:
    """Fetch remaining stops count for Palkhi before Pandharpur."""
    if palkhi_id:
        palkhi = db.scalars(select(Palkhi).where(Palkhi.id == palkhi_id)).first()
    else:
        palkhi = db.scalars(select(Palkhi).where(Palkhi.name.ilike("%Sant Dnyaneshwar%"))).first()

    if not palkhi:
        return "माफ करा, पालखीच्या मार्गाची माहिती उपलब्ध नाही."

    current_seq = 0
    if palkhi.current_checkpoint_id:
        current_cp = db.scalars(select(RouteCheckpoint).where(RouteCheckpoint.id == palkhi.current_checkpoint_id)).first()
        if current_cp:
            current_seq = current_cp.sequence_number

    remaining_cps = db.scalars(
        select(RouteCheckpoint)
        .where(
            RouteCheckpoint.palkhi_id == palkhi.id,
            RouteCheckpoint.sequence_number > current_seq
        )
        .order_by(RouteCheckpoint.sequence_number)
    ).all()

    count = len(remaining_cps)
    prefix = "तुकोबांच्या" if "Tukaram" in palkhi.name else "माऊलींच्या"
    if count == 0:
        return f"{prefix} पालखी पंढरपूर येथे पोहोचली आहे."

    next_three = ", ".join([cp.location_name for cp in remaining_cps[:3]])
    return f"{prefix} पालखीचे पंढरपूरला पोहोचण्यापूर्वी अजून {count} मुक्काम आहेत. पुढचे मुख्य थांबे: {next_three}."


def resolve_location_name(text: str) -> Optional[Tuple[float, float]]:
    """Attempt to extract known checkpoint coordinates from text."""
    clean_text = text.lower()
    for key, coords in DEMO_CHECKPOINTS.items():
        if key in clean_text:
            return coords
    return None


def find_nearest_medical_tool(
    db: Session, text: str = ""
) -> Tuple[str, bool]:
    """
    Search database for nearest medical facilities.
    Returns (response_text, requires_followup).
    """
    coords = resolve_location_name(text)

    if not coords:
        return ("ठीक आहे. तुम्ही सध्या कोणत्या गावाजवळ आहात?", True)

    lat, lon = coords

    facilities = db.scalars(select(Facility).where(Facility.type.ilike("%MEDICAL%"))).all()
    if not facilities:
        facilities = db.scalars(select(Facility)).all()

    if not facilities:
        return ("या ठिकाणाजवळ नोंदणीकृत वैद्यकीय केंद्र सापडलं नाही.", False)

    import math

    def calc_dist(f):
        dlat = math.radians(f.latitude - lat)
        dlon = math.radians(f.longitude - lon)
        a = (
            math.sin(dlat / 2.0) ** 2
            + math.cos(math.radians(lat))
            * math.cos(math.radians(f.latitude))
            * math.sin(dlon / 2.0) ** 2
        )
        return 6371000.0 * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    facility = min(facilities, key=calc_dist)
    dist_m = calc_dist(facility)

    dist_str = f"{dist_m / 1000.0:.1f} किलोमीटर" if dist_m >= 1000 else f"{int(dist_m)} मीटर"
    landmark = f", {facility.landmark}जवळ" if facility.landmark else ""
    return (f"सर्वात जवळ {facility.name}{landmark} आहे. ते सुमारे {dist_str} अंतरावर आहे.", False)


def _safe_age(value) -> int:
    """Convert age value to int, returning 0 if not numeric."""
    try:
        return int(str(value).strip())
    except (ValueError, TypeError):
        import re
        digits = re.findall(r"\d+", str(value))
        return int(digits[0]) if digits else 0


def create_missing_person_report_tool(db: Session, data: dict) -> str:
    """Save missing person report to database and generate ticket ID."""
    ticket_id = generate_ticket_id(db)

    mp = MissingPerson(
        ticket_id=ticket_id,
        name=data.get("name", "अज्ञात"),
        age=_safe_age(data.get("age", 0)),
        clothing=data.get("clothing", "माहिती नाही"),
        description=data.get("description", "Agent via Marathi voice flow"),
        last_seen_location=data.get("last_seen_location", "वारी मार्ग"),
        last_seen_time=datetime.now(timezone.utc),
        contact=data.get("contact", "माहिती नाही"),
        status="OPEN"
    )

    db.add(mp)
    db.commit()
    db.refresh(mp)

    # Broadcast MISSING_PERSON_CREATED event over WebSocket
    event_data = {
        "ticket_id": mp.ticket_id,
        "name": mp.name,
        "age": mp.age,
        "clothing": mp.clothing,
        "last_seen_location": mp.last_seen_location,
        "contact": mp.contact,
        "status": mp.status,
        "created_at": mp.created_at.isoformat()
    }
    ws_manager.broadcast_sync("MISSING_PERSON_CREATED", event_data)

    return f"नोंद झाली आहे. तुमचा तिकीट क्रमांक {mp.ticket_id} आहे."
