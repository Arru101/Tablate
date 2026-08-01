type EventCallback = (data: any) => void;

class SimulatedWebSocketService {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  public isConnected: boolean = true;

  constructor() {
    console.log('[WebSocket Gateway] Initialized simulated real-time channel.');
  }

  public subscribe(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.unsubscribe(event, callback);
  }

  public unsubscribe(event: string, callback: EventCallback) {
    const subs = this.listeners.get(event);
    if (subs) {
      subs.delete(callback);
    }
  }

  public emit(event: string, data: any) {
    const subs = this.listeners.get(event);
    if (subs) {
      subs.forEach((cb) => cb(data));
    }
  }
}

export const wsService = new SimulatedWebSocketService();
