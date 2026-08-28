import argparse
import sys
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.connection import SessionLocal
from app.models.palkhi import Palkhi, RouteCheckpoint
from app.services.websocket_manager import ws_manager


def advance_palkhi_simulator(palkhi_query: str, next_step: bool = False, set_location: str = None):
    db: Session = SessionLocal()
    try:
        query = select(Palkhi)
        if "dnyan" in palkhi_query.lower() or "mauli" in palkhi_query.lower():
            query = query.where(Palkhi.name.ilike("%Dnyaneshwar%"))
        elif "tuka" in palkhi_query.lower():
            query = query.where(Palkhi.name.ilike("%Tukaram%"))
        else:
            query = query.where(Palkhi.name.ilike(f"%{palkhi_query}%"))

        palkhi = db.scalars(query).first()
        if not palkhi:
            print(f"[ERROR] Palkhi matching '{palkhi_query}' not found.")
            return

        checkpoints = db.scalars(
            select(RouteCheckpoint)
            .where(RouteCheckpoint.palkhi_id == palkhi.id)
            .order_by(RouteCheckpoint.sequence_number)
        ).all()

        if not checkpoints:
            print(f"[ERROR] No route checkpoints found for Palkhi '{palkhi.name}'.")
            return

        current_cp = None
        if palkhi.current_checkpoint_id:
            current_cp = next((c for c in checkpoints if c.id == palkhi.current_checkpoint_id), None)

        if set_location:
            target_cp = next((c for c in checkpoints if set_location.lower() in c.location_name.lower()), None)
            if not target_cp:
                print(f"[ERROR] Checkpoint matching '{set_location}' not found for {palkhi.name}.")
                return
            new_cp = target_cp
        elif next_step:
            if not current_cp:
                new_cp = checkpoints[0]
            else:
                curr_idx = next((i for i, c in enumerate(checkpoints) if c.id == current_cp.id), 0)
                next_idx = min(curr_idx + 1, len(checkpoints) - 1)
                new_cp = checkpoints[next_idx]
        else:
            new_cp = current_cp or checkpoints[0]

        palkhi.current_checkpoint_id = new_cp.id
        palkhi.current_latitude = new_cp.latitude
        palkhi.current_longitude = new_cp.longitude
        palkhi.updated_at = datetime.now(timezone.utc)
        db.commit()

        next_name = new_cp.next_checkpoint or "End of Route"
        print(f"[SIMULATOR] {palkhi.name}")
        print(f"            Current Checkpoint : #{new_cp.sequence_number} {new_cp.location_name}")
        print(f"            Next Checkpoint    : {next_name}")
        print(f"            Coordinates        : ({new_cp.latitude}, {new_cp.longitude})")
        print(f"            Halt Type / Ringan : {new_cp.halt_type} | Ringan: {new_cp.is_ringan}")
        print(f"            Updated At         : {palkhi.updated_at.isoformat()}")

        # Broadcast PALKHI_LOCATION_UPDATED event over WebSocket
        event_payload = {
            "palkhi_id": palkhi.id,
            "name": palkhi.name,
            "current_location": new_cp.location_name,
            "latitude": new_cp.latitude,
            "longitude": new_cp.longitude,
            "sequence_number": new_cp.sequence_number,
            "next_checkpoint": new_cp.next_checkpoint,
            "updated_at": palkhi.updated_at.isoformat()
        }
        ws_manager.broadcast_sync("PALKHI_LOCATION_UPDATED", event_payload)

    finally:
        db.close()


def print_palkhi_status():
    db: Session = SessionLocal()
    try:
        palkhis = db.scalars(select(Palkhi)).all()
        print("\n=======================================================")
        print("[STATUS] WariVaani Multi-Palkhi Current Simulator Status")
        print("=======================================================")
        for p in palkhis:
            curr_name = "Unknown"
            if p.current_checkpoint_id:
                cp = db.scalars(select(RouteCheckpoint).where(RouteCheckpoint.id == p.current_checkpoint_id)).first()
                if cp:
                    curr_name = f"#{cp.sequence_number} {cp.location_name} (Next: {cp.next_checkpoint or 'None'})"
            print(f"- {p.name}: {curr_name}")
        print("=======================================================\n")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="WariVaani Palkhi GPS Demo Simulator")
    parser.add_argument("--palkhi", type=str, choices=["dnyaneshwar", "tukaram"], help="Palkhi identifier")
    parser.add_argument("--next", action="store_true", help="Move Palkhi to next sequence checkpoint")
    parser.add_argument("--set", type=str, help="Set Palkhi to specific location name")
    parser.add_argument("--status", action="store_true", help="Print current status of all Palkhis")

    args = parser.parse_args()

    if args.status or not args.palkhi:
        print_palkhi_status()
        return

    advance_palkhi_simulator(palkhi_query=args.palkhi, next_step=args.next, set_location=args.set)


if __name__ == "__main__":
    main()
