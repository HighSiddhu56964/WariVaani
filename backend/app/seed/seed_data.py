import json
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select
from geoalchemy2.elements import WKTElement

from app.database.connection import SessionLocal
from app.models.palkhi import Palkhi, RouteCheckpoint
from app.models.facility import Facility
from app.models.missing_person import MissingPerson
from app.models.lost_item import LostItemReport


DNYANESHWAR_ROUTE = [
    {"seq": 1, "name": "Alandi", "lat": 18.6775, "lon": 73.8967, "halt": "START", "notes": "Departure"},
    {"seq": 2, "name": "Pune - Bhavani Peth", "lat": 18.5135, "lon": 73.8690, "halt": "MUKKAM", "notes": "Stay"},
    {"seq": 3, "name": "Saswad", "lat": 18.3444, "lon": 74.0305, "halt": "MUKKAM", "notes": "Stay"},
    {"seq": 4, "name": "Jejuri", "lat": 18.2741, "lon": 74.1565, "halt": "HALT", "notes": "Halt"},
    {"seq": 5, "name": "Walhe", "lat": 18.1793, "lon": 74.2057, "halt": "HALT", "notes": "Halt"},
    {"seq": 6, "name": "Lonand", "lat": 18.0416, "lon": 74.1866, "halt": "MUKKAM", "notes": "Major rest"},
    {"seq": 7, "name": "Tardgaon", "lat": 17.9944, "lon": 74.2411, "halt": "RINGAN", "notes": "First Ringan at Chandobacha Limb", "is_ringan": True, "ringan_type": "ROUND"},
    {"seq": 8, "name": "Phaltan", "lat": 17.9866, "lon": 74.4300, "halt": "HALT", "notes": "Halt"},
    {"seq": 9, "name": "Barad", "lat": 17.9264, "lon": 74.5511, "halt": "HALT", "notes": "Halt"},
    {"seq": 10, "name": "Natepute", "lat": 17.8967, "lon": 74.7570, "halt": "HALT", "notes": "Halt"},
    {"seq": 11, "name": "Malshiras", "lat": 17.8344, "lon": 74.8021, "halt": "RINGAN", "notes": "Ringan at Purandavade", "is_ringan": True, "ringan_type": "ROUND"},
    {"seq": 12, "name": "Khudus Phata", "lat": 17.8105, "lon": 74.9012, "halt": "RINGAN", "notes": "Second round Ringan", "is_ringan": True, "ringan_type": "SECOND_ROUND"},
    {"seq": 13, "name": "Velapur", "lat": 17.7850, "lon": 75.0210, "halt": "RINGAN", "notes": "Ringan near Thakurbuwa Samadhi", "is_ringan": True, "ringan_type": "ROUND"},
    {"seq": 14, "name": "Bhandishegaon", "lat": 17.7310, "lon": 75.1840, "halt": "RINGAN", "notes": "Standing Ringan", "is_ringan": True, "ringan_type": "STANDING"},
    {"seq": 15, "name": "Vakhri", "lat": 17.6980, "lon": 75.2850, "halt": "RINGAN", "notes": "Final standing Ringan", "is_ringan": True, "ringan_type": "STANDING"},
    {"seq": 16, "name": "Pandharpur", "lat": 17.6773, "lon": 75.3239, "halt": "DESTINATION", "notes": "Destination"},
]

TUKARAM_ROUTE = [
    {"seq": 1, "name": "Dehu", "lat": 18.7208, "lon": 73.7711, "halt": "START", "notes": "Departure"},
    {"seq": 2, "name": "Akurdi", "lat": 18.6494, "lon": 73.7806, "halt": "HALT", "notes": "Halt"},
    {"seq": 3, "name": "Pune - Nana Peth", "lat": 18.5186, "lon": 73.8647, "halt": "MUKKAM", "notes": "Stay"},
    {"seq": 4, "name": "Loni Kalbhor", "lat": 18.4878, "lon": 74.0202, "halt": "HALT", "notes": "Halt"},
    {"seq": 5, "name": "Yavat", "lat": 18.4651, "lon": 74.2085, "halt": "HALT", "notes": "Halt"},
    {"seq": 6, "name": "Varvand", "lat": 18.3995, "lon": 74.3411, "halt": "HALT", "notes": "Halt"},
    {"seq": 7, "name": "Undavadi Gawlyachi", "lat": 18.2811, "lon": 74.4510, "halt": "MUKKAM", "notes": "Stay"},
    {"seq": 8, "name": "Baramati", "lat": 18.1517, "lon": 74.5771, "halt": "HALT", "notes": "Halt"},
    {"seq": 9, "name": "Sansar", "lat": 18.0645, "lon": 74.6512, "halt": "MUKKAM", "notes": "Stay"},
    {"seq": 10, "name": "Nimgaon Ketki", "lat": 18.0123, "lon": 74.7210, "halt": "HALT", "notes": "Halt"},
    {"seq": 11, "name": "Indapur", "lat": 17.9644, "lon": 74.8010, "halt": "MUKKAM", "notes": "Rest stop"},
    {"seq": 12, "name": "Sarati", "lat": 17.9120, "lon": 74.9210, "halt": "HALT", "notes": "Halt"},
    {"seq": 13, "name": "Akluj", "lat": 17.8860, "lon": 75.0210, "halt": "RINGAN", "notes": "Round Ringan", "is_ringan": True, "ringan_type": "ROUND"},
    {"seq": 14, "name": "Malinagar", "lat": 17.8420, "lon": 75.1012, "halt": "HALT", "notes": "Intermediate stop"},
    {"seq": 15, "name": "Borgaon", "lat": 17.7710, "lon": 75.1912, "halt": "MUKKAM", "notes": "Stay"},
    {"seq": 16, "name": "Vakhri", "lat": 17.6980, "lon": 75.2850, "halt": "MUKKAM", "notes": "Final major halt"},
    {"seq": 17, "name": "Pandharpur", "lat": 17.6773, "lon": 75.3239, "halt": "DESTINATION", "notes": "Destination"},
]


def seed_palkhi_and_checkpoints(db: Session, name: str, saint: str, route_name: str, checkpoints_data: list, default_current_seq: int = 3):
    palkhi = db.scalars(select(Palkhi).where(Palkhi.name == name)).first()

    if not palkhi:
        palkhi = Palkhi(
            name=name,
            saint_name=saint,
            route_name=route_name,
            source="GEOCODED_REFERENCE",
            source_year=2025,
            data_type="REFERENCE_2025"
        )
        db.add(palkhi)
        db.commit()
        db.refresh(palkhi)
        print(f"[OK] Created Palkhi entity: {palkhi.name}")

    # Clear existing checkpoints to ensure clean sequence numbering
    db.query(RouteCheckpoint).filter(RouteCheckpoint.palkhi_id == palkhi.id).delete()
    db.commit()

    # Seed checkpoints
    cp_by_seq = {}
    for item in checkpoints_data:
        wkt = f"POINT({item['lon']} {item['lat']})"
        next_cp_name = checkpoints_data[item["seq"]]["name"] if item["seq"] < len(checkpoints_data) else None

        cp = RouteCheckpoint(
            palkhi_id=palkhi.id,
            sequence_number=item["seq"],
            location_name=item["name"],
            latitude=item["lat"],
            longitude=item["lon"],
            next_checkpoint=next_cp_name,
            halt_type=item["halt"],
            notes=item["notes"],
            is_ringan=item.get("is_ringan", False),
            ringan_type=item.get("ringan_type"),
            source_year=2025,
            data_type="REFERENCE_2025",
            location_geom=wkt
        )
        db.add(cp)
        db.commit()
        db.refresh(cp)
        cp_by_seq[item["seq"]] = cp

    # Set current active checkpoint on Palkhi
    curr_cp = cp_by_seq.get(default_current_seq) or cp_by_seq.get(1)
    if curr_cp:
        palkhi.current_checkpoint_id = curr_cp.id
        palkhi.current_latitude = curr_cp.latitude
        palkhi.current_longitude = curr_cp.longitude
        palkhi.updated_at = datetime.now(timezone.utc)
        db.commit()

    print(f"[OK] Seeded {len(checkpoints_data)} checkpoints for {name}. Current: {curr_cp.location_name if curr_cp else 'None'}")


def seed_facilities(db: Session):
    facilities_data = [
        {"name": "Alandi Temple Medical Aid Camp", "type": "MEDICAL_CAMP", "lat": 18.6775, "lon": 73.8967, "landmark": "Near Indrayani Ghat Gate 2"},
        {"name": "Pune Swargate Emergency Medical & First Aid", "type": "MEDICAL_CAMP", "lat": 18.5089, "lon": 73.8567, "landmark": "Near Swargate Bus Stand Exit 1"},
        {"name": "Saswad Emergency Medical Camp", "type": "MEDICAL_CAMP", "lat": 18.3444, "lon": 74.0305, "landmark": "Sangameshwar Temple Ground"},
        {"name": "Jejuri Hill Base First Aid Camp", "type": "MEDICAL_CAMP", "lat": 18.2741, "lon": 74.1565, "landmark": "Near Khandoba Temple Stairs"},
        {"name": "Lonand Station Medical Aid", "type": "MEDICAL_CAMP", "lat": 18.0416, "lon": 74.1866, "landmark": "Near Lonand ST Depot"},
        {"name": "Phaltan Civil Hospital Help Desk", "type": "MEDICAL_CAMP", "lat": 17.9866, "lon": 74.4300, "landmark": "Phaltan Ring Road Junction"},
        {"name": "Dehu Emergency Medical Camp", "type": "MEDICAL_CAMP", "lat": 18.7208, "lon": 73.7711, "landmark": "Near Gatha Temple Gate"},
        {"name": "Loni Kalbhor Medical Center", "type": "MEDICAL_CAMP", "lat": 18.4878, "lon": 74.0202, "landmark": "Near MIT ADT Campus Gate"},
    ]

    for fac in facilities_data:
        existing = db.scalars(select(Facility).where(Facility.name == fac["name"])).first()
        if not existing:
            wkt = f"POINT({fac['lon']} {fac['lat']})"
            db.add(Facility(
                name=fac["name"],
                type=fac["type"],
                latitude=fac["lat"],
                longitude=fac["lon"],
                landmark=fac["landmark"],
                status="ACTIVE",
                source="GEOCODED_REFERENCE",
                location_geom=wkt,
            ))
    db.commit()
    print("[OK] Seeded facilities data.")


def seed_missing_persons(db: Session):
    sample_reports = [
        {
            "ticket_id": "WR-10001",
            "name": "रामचंद्र मारुती जगताप",
            "age": 68,
            "clothing": "पांढरा कुर्ता, धोती, डोक्यावर पांढरी टोपी",
            "description": "सासवड मुक्कामाजवळ वारकरी गर्दीत ताटातूट झाली",
            "last_seen_location": "सासवड",
            "contact": "+91 98220 12345",
            "source": "VOICE_CALL",
            "status": "OPEN",
        },
        {
            "ticket_id": "WR-10002",
            "name": "आनंदीबाई सोपान शिंदे",
            "age": 62,
            "clothing": "हिरवी नऊवारी साडी, गळ्यात तुळशीची माळ",
            "description": "जेजुरी मंदिर पायऱ्यांजवळ चुकल्या",
            "last_seen_location": "जेजुरी",
            "contact": "+91 94231 67890",
            "source": "MOBILE_APP",
            "status": "OPEN",
        },
        {
            "ticket_id": "WR-10003",
            "name": "गणेश पांडुरंग मोरे",
            "age": 10,
            "clothing": "निळा टी-शर्ट, काळी हाफ पँट",
            "description": "लोणंद बस स्थानकाजवळ पालखी दर्शनावेळी मागे राहिला",
            "last_seen_location": "लोणंद",
            "contact": "+91 98900 11223",
            "source": "VOICE_CALL",
            "status": "UNDER_REVIEW",
        },
        {
            "ticket_id": "WR-10004",
            "name": "सखुबाई विठ्ठल ढमढेरे",
            "age": 71,
            "clothing": "लाल साडी, हातात पितळी तांब्या",
            "description": "हडपसर रिंगण पाहताना पुढे गेल्या",
            "last_seen_location": "हडपसर",
            "contact": "+91 97654 32109",
            "source": "MOBILE_APP",
            "status": "RESOLVED",
        },
    ]

    for item in sample_reports:
        existing = db.scalars(select(MissingPerson).where(MissingPerson.ticket_id == item["ticket_id"])).first()
        if not existing:
            db.add(MissingPerson(
                ticket_id=item["ticket_id"],
                name=item["name"],
                age=item["age"],
                clothing=item["clothing"],
                description=item["description"],
                last_seen_location=item["last_seen_location"],
                last_seen_time=datetime.now(timezone.utc),
                contact=item["contact"],
                source=item["source"],
                status=item["status"]
            ))
    db.commit()
    print("[OK] Seeded missing persons data.")


def seed_lost_found_reports(db: Session):
    sample_items = [
        {
            "ticket_id": "LI-10001",
            "report_type": "LOST",
            "item_type": "पिशवी / काळी बॅग",
            "color": "काळी",
            "description": "कातडी पाकीट आणि काही महत्त्वाचे दस्तऐवज असलेली काळी पिशवी",
            "location": "सासवड मुक्काम",
            "contact_number": "+91 98221 00112",
            "source": "VOICE_CALL",
            "status": "OPEN",
        },
        {
            "ticket_id": "LI-10002",
            "report_type": "LOST",
            "item_type": "मोबाईल फोन (स्मार्टफोन)",
            "color": "निळा",
            "description": "सॅमसंग कंपनीचा स्मार्टफोन, निळ्या रंगाचे कव्हर",
            "location": "जेजुरी मंदिर परिसर",
            "contact_number": "+91 94230 44556",
            "source": "MOBILE_APP",
            "status": "UNDER_REVIEW",
        },
        {
            "ticket_id": "FI-10001",
            "report_type": "FOUND",
            "item_type": "चामड्याचे पाकीट",
            "color": "ब्राऊन / तपकिरी",
            "description": "तपकिरी रंगाचे पाकीट, त्यामध्ये आधार कार्ड व थोडे पैसे आहेत",
            "location": "लोणंद रिंगण मैदान",
            "contact_number": "+91 97650 99887",
            "source": "VOICE_CALL",
            "status": "OPEN",
        },
        {
            "ticket_id": "FI-10002",
            "report_type": "FOUND",
            "item_type": "चष्मा व डबा",
            "color": "सोनेरी",
            "description": "सोन्यासारख्या फ्रेमचा चष्मा आणि प्लास्टिक डबा",
            "location": "हडपसर",
            "contact_number": "+91 98901 22334",
            "source": "MOBILE_APP",
            "status": "RESOLVED",
        },
    ]

    for item in sample_items:
        existing = db.scalars(select(LostItemReport).where(LostItemReport.ticket_id == item["ticket_id"])).first()
        if not existing:
            db.add(LostItemReport(
                ticket_id=item["ticket_id"],
                report_type=item["report_type"],
                item_type=item["item_type"],
                color=item["color"],
                description=item["description"],
                location=item["location"],
                contact_number=item["contact_number"],
                source=item["source"],
                status=item["status"]
            ))
    db.commit()
    print("[OK] Seeded Lost & Found data.")


def seed_database():
    """Populate database for both Palkhis and route checkpoints."""
    from app.database.connection import engine
    from app.models import Base
    from sqlalchemy import text

    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        print("[START] Starting WariVaani Multi-Palkhi database seeding...")
        db.execute(text("ALTER TABLE missing_person ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'VOICE_CALL' NOT NULL;"))
        db.commit()

        seed_palkhi_and_checkpoints(
            db,
            name="Sant Dnyaneshwar Maharaj Palkhi",
            saint="Sant Dnyaneshwar Maharaj",
            route_name="Alandi to Pandharpur",
            checkpoints_data=DNYANESHWAR_ROUTE,
            default_current_seq=3  # Saswad
        )
        seed_palkhi_and_checkpoints(
            db,
            name="Sant Tukaram Maharaj Palkhi",
            saint="Sant Tukaram Maharaj",
            route_name="Dehu to Pandharpur",
            checkpoints_data=TUKARAM_ROUTE,
            default_current_seq=4  # Loni Kalbhor
        )
        seed_facilities(db)
        seed_missing_persons(db)
        seed_lost_found_reports(db)
        print("[SUCCESS] Multi-Palkhi Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
