import asyncio
import json
from typing import List, Dict, Any
from fastapi import WebSocket


class ConnectionManager:
    """In-memory WebSocket Connection Manager for WariVaani real-time events."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WS] Client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WS] Client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast_event(self, event_type: str, data: Dict[str, Any]):
        """Broadcast JSON event payload to all connected clients."""
        message = {
            "type": event_type,
            "data": data
        }
        print(f"[WS BROADCAST] Event '{event_type}' -> {len(self.active_connections)} client(s)")
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"[WS ERROR] Connection failed: {e}")
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)

    def broadcast_sync(self, event_type: str, data: Dict[str, Any]):
        """
        Thread-safe helper to broadcast events from synchronous backend contexts
        (e.g., Palkhi simulator script, voice agent tools, HTTP route handlers).
        """
        try:
            loop = asyncio.get_running_loop()
            if loop.is_running():
                asyncio.run_coroutine_threadsafe(self.broadcast_event(event_type, data), loop)
            else:
                loop.run_until_complete(self.broadcast_event(event_type, data))
        except RuntimeError:
            asyncio.run(self.broadcast_event(event_type, data))


ws_manager = ConnectionManager()
