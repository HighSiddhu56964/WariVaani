from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, palkhi, facilities, missing_person, lost_found, agent, dashboard, demo
from app.services.websocket_manager import ws_manager

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="WariVaani (वारीवाणी) - Digital Assistance & Emergency Platform for Pandharpur Wari",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for Next.js frontend, ngrok, and Exotel telephony
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


try:
    from app.telephony.exotel import router as telephony_router
    app.include_router(telephony_router)
    print("✅ [TELEPHONY] Router registered successfully (/telephony/health, /telephony/debug, /telephony/test, /telephony/exotel)", flush=True)
except Exception as tel_err:
    print(f"❌ [TELEPHONY CRITICAL ERROR] Failed to load telephony router: {tel_err}", flush=True)
    import traceback
    traceback.print_exc()


# Mount Health router at root
app.include_router(health.router)

# Mount API routers with API prefix (/api/v1)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(palkhi.router, prefix=settings.API_V1_STR)
app.include_router(facilities.router, prefix=settings.API_V1_STR)
app.include_router(missing_person.router, prefix=settings.API_V1_STR)
app.include_router(lost_found.router, prefix=settings.API_V1_STR)
app.include_router(agent.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(demo.router, prefix=settings.API_V1_STR)

# Top-level route mounts for convenience
app.include_router(palkhi.router)
app.include_router(facilities.router)
app.include_router(missing_person.router)
app.include_router(lost_found.router)
app.include_router(agent.router)
app.include_router(dashboard.router)
app.include_router(demo.router)

