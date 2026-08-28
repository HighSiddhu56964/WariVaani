from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, palkhi, facilities, missing_person, agent, dashboard, demo
from app.services.websocket_manager import ws_manager

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="WariVaani (वारीवाणी) - Digital Assistance & Emergency Platform for Pandharpur Wari",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for Person 2's Next.js frontend (e.g., http://localhost:3000)
origins = getattr(settings, "CORS_ORIGINS", ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/events")
async def websocket_events_endpoint(websocket: WebSocket):
    """
    Real-time WebSocket endpoint for Palkhi updates, missing person alerts, and facility status updates.
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data.strip().lower() == "ping":
                await websocket.send_json({"type": "PONG", "status": "ok"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


# Mount Health router at root
app.include_router(health.router)

# Mount API routers with API prefix (/api/v1)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(palkhi.router, prefix=settings.API_V1_STR)
app.include_router(facilities.router, prefix=settings.API_V1_STR)
app.include_router(missing_person.router, prefix=settings.API_V1_STR)
app.include_router(agent.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(demo.router, prefix=settings.API_V1_STR)

# Top-level route mounts for convenience
app.include_router(palkhi.router)
app.include_router(facilities.router)
app.include_router(missing_person.router)
app.include_router(agent.router)
app.include_router(dashboard.router)
app.include_router(demo.router)
