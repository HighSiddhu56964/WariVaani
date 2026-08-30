"""
WariVaani Hackathon Demo & Reset Utilities
Provides python entry points:
- verify_missing_persons()
- reset_demo()
- advance_palkhi()
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from app.database.connection import SessionLocal
from app.models.missing_person import MissingPerson
from app.models.lost_item import LostItemReport
from app.models.palkhi import Palkhi
from app.seed.seed_data import seed_database
from app.services.palkhi_simulator import advance_palkhi_simulator


def verify_missing_persons() -> List[Dict[str, Any]]:
    """
    Retrieve and display current missing person and lost/found database records.
    """
    db: Session = SessionLocal()
    try:
        persons = db.scalars(select(MissingPerson).order_by(MissingPerson.id)).all()
        items = db.scalars(select(LostItemReport).order_by(LostItemReport.id)).all()
        
        print(f"\n=======================================================")
        print(f"[DEMO VERIFY] Total Missing Person Records: {len(persons)}")
        print(f"=======================================================")
        results = []
        for p in persons:
            try:
                print(f"  [{p.ticket_id}] {p.name} (Age: {p.age}) | Loc: {p.last_seen_location} | Status: {p.status} | Source: {p.source}")
            except UnicodeEncodeError:
                print(f"  [{p.ticket_id}] {p.name.encode('utf-8', errors='ignore')} | Status: {p.status}")
            results.append({
                "ticket_id": p.ticket_id,
                "name": p.name,
                "status": p.status
            })

        print(f"\n=======================================================")
        print(f"[DEMO VERIFY] Total Lost & Found Records: {len(items)}")
        print(f"=======================================================")
        for item in items:
            try:
                print(f"  [{item.ticket_id}] ({item.report_type}) {item.item_type} ({item.color}) | Loc: {item.location} | Status: {item.status}")
            except UnicodeEncodeError:
                print(f"  [{item.ticket_id}] ({item.report_type}) | Status: {item.status}")

        print(f"=======================================================\n")
        return results
    finally:
        db.close()


def reset_demo() -> Dict[str, Any]:
    """
    Cleanly reset all demo data and re-seed clean initial state.
    """
    print("\n[DEMO RESET] Purging missing person & lost-found records and re-seeding database...")
    db: Session = SessionLocal()
    try:
        db.execute(delete(MissingPerson))
        db.execute(delete(LostItemReport))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[DEMO RESET WARN] Clear error: {e}")
    finally:
        db.close()

    seed_database()
    print("[DEMO RESET] Completed clean demo environment reset!")
    return {"status": "ok", "message": "Demo data successfully reset."}


def advance_palkhi(palkhi: str = "dnyaneshwar", next_step: bool = True, set_location: Optional[str] = None):
    """
    Advance Palkhi simulator to next checkpoint or specific location.
    """
    advance_palkhi_simulator(palkhi_query=palkhi, next_step=next_step, set_location=set_location)


if __name__ == "__main__":
    import sys
    cmd = sys.argv[1] if len(sys.argv) > 1 else "verify"
    if cmd == "reset":
        reset_demo()
    elif cmd == "advance":
        target = sys.argv[2] if len(sys.argv) > 2 else "dnyaneshwar"
        advance_palkhi(target, next_step=True)
    else:
        verify_missing_persons()
