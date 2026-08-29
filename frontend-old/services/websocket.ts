export type WariEventType =
  | "PALKHI_LOCATION_UPDATED"
  | "MISSING_PERSON_CREATED"
  | "MISSING_PERSON_STATUS_UPDATED"
  | "FACILITY_UPDATED"
  | "PONG";

export interface WariEvent<T = any> {
  type: WariEventType;
  data?: T;
  timestamp?: string;
}

type EventListener = (event: WariEvent) => void;

class WariWebSocketManager {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<EventListener>> = new Map();
  private reconnectInterval: number = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;
  private pingInterval: NodeJS.Timeout | null = null;

  private getWsUrl(): string {
    if (typeof window === "undefined") return "ws://localhost:8000/ws/events";
    
    if (process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsProto = apiUrl.startsWith("https") ? "wss" : "ws";
    const host = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `${wsProto}://${host}/ws/events`;
  }

  public connect() {
    if (typeof window === "undefined" || this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const url = this.getWsUrl();

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log(`⚡ WebSocket Connected to WariVaani event stream: ${url}`);
        this.isConnecting = false;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed: WariEvent = JSON.parse(event.data);
          this.notifyListeners(parsed.type, parsed);
          // Also notify wildcard listeners
          this.notifyListeners("*", parsed);
        } catch (e) {
          console.warn("Failed to parse WebSocket message:", event.data);
        }
      };

      this.ws.onerror = (err) => {
        console.warn("WebSocket error:", err);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log("WebSocket connection closed. Scheduling auto-reconnect...");
        this.isConnecting = false;
        this.stopHeartbeat();
        this.scheduleReconnect();
      };
    } catch (err) {
      console.warn("Failed to initialize WebSocket:", err);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send("ping");
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectTimer && typeof window !== "undefined") {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, this.reconnectInterval);
    }
  }

  public subscribe(eventType: string, callback: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Auto-connect on first subscription
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    }

    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  private notifyListeners(eventType: string, event: WariEvent) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => cb(event));
    }
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wariWsManager = new WariWebSocketManager();
