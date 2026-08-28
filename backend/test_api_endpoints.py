import sys
sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_routes():
    print("Testing GET /dashboard/summary...")
    r = client.get("/dashboard/summary")
    assert r.status_code == 200
    print("  --> Dashboard summary response:")
    print(r.json())

    print("\nTesting GET /palkhis...")
    r = client.get("/palkhis")
    assert r.status_code == 200
    palkhis = r.json()
    print(f"  --> Found {len(palkhis)} Palkhis")

    for p in palkhis:
        pid = p["id"]
        pname = p["name"]
        print(f"\nTesting routes for Palkhi ID {pid}: {pname}")

        r_detail = client.get(f"/palkhis/{pid}")
        assert r_detail.status_code == 200

        r_route = client.get(f"/palkhis/{pid}/route")
        assert r_route.status_code == 200
        print(f"  --> Route checkpoints count: {len(r_route.json())}")

        r_curr = client.get(f"/palkhis/{pid}/current")
        assert r_curr.status_code == 200
        print(f"  --> Current location: {r_curr.json()['current_checkpoint']}")

        r_next = client.get(f"/palkhis/{pid}/next-halt")
        assert r_next.status_code == 200
        print(f"  --> Next halt: {r_next.json()['location_name']}")

        r_ringan = client.get(f"/palkhis/{pid}/next-ringan")
        assert r_ringan.status_code == 200
        print(f"  --> Next Ringan: {r_ringan.json()['location_name']} ({r_ringan.json()['notes']})")

    print("\nALL API ENDPOINTS TESTED AND PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_routes()
