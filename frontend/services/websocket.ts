// Centralized WebSocket Manager for Live WariVaani Events (WS /ws/events)

export type WSEventType =
  | 'MISSING_PERSON_CREATED'
  | 'MISSING_PERSON_STATUS_UPDATED'
  | 'LOST_FOUND_CREATED'
  | 'LOST_FOUND_STATUS_UPDATED'
  | 'PALKHI_LOCATION_UPDATED'
  | 'FACILITY_STATUS_UPDATED'
  | 'PONG'
  | 'CONNECTED';

export interface WSEvent<T = unknown> {
  event: WSEventType | string;
  data: T;
}

type EventCallback = (event: WSEvent) => void;

class WariVaaniWebSocketManager {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnecting = false;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  private getWsUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const host = baseUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${host}/ws/events`;
  }

  public connect(): void {
    if (this.socket || this.isConnecting) return;
    this.isConnecting = true;

    try {
      const url = this.getWsUrl();
      console.log(`[WS] Connecting to ${url}...`);
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('[WS] Connected successfully to /ws/events');
        this.isConnecting = false;
        this.notify('CONNECTED', { status: 'connected' });

        // Start ping heartbeat
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send('ping');
          }
        }, 15000);
      };

      this.socket.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data);
          const eventType = parsed.event || parsed.type || 'UNKNOWN';
          const eventData = parsed.data || parsed;
          this.notify(eventType, eventData);
        } catch {
          // Plain string handling
          if (msg.data.trim() === 'PONG') {
            this.notify('PONG', { status: 'ok' });
          }
        }
      };

      this.socket.onclose = () => {
        console.log('[WS] Disconnected from /ws/events. Reconnecting in 3s...');
        this.cleanup();
        this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
      };

      this.socket.onerror = (err) => {
        console.error('[WS] Error:', err);
        this.socket?.close();
      };
    } catch (e) {
      console.error('[WS] Connection exception:', e);
      this.cleanup();
      this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
    }
  }

  public subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(callback);

    // Auto-connect on first subscription
    if (!this.socket && !this.isConnecting) {
      this.connect();
    }

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  private notify(eventType: string, data: unknown) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => cb({ event: eventType, data }));
    }
    // Also notify wildcard listeners
    const wildcardCallbacks = this.listeners.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((cb) => cb({ event: eventType, data }));
    }
  }

  private cleanup() {
    this.socket = null;
    this.isConnecting = false;
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
  }
}

export const wsManager = new WariVaaniWebSocketManager();
