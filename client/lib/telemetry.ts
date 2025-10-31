export type TelemetryEvent = {
  id: string;
  event: string;
  userId?: string;
  timestamp: string;
  payload?: Record<string, unknown>;
};

const TELEMETRY_KEY = "sobrTelemetryEvents";

function readEvents(): TelemetryEvent[] {
  try {
    const raw = localStorage.getItem(TELEMETRY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TelemetryEvent[];
  } catch (e) {
    return [];
  }
}

function saveEvents(events: TelemetryEvent[]) {
  try {
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(events));
  } catch (e) {
    // ignore quota errors
  }
}

export function recordTelemetryEvent(event: Omit<TelemetryEvent, "id" | "timestamp">) {
  const ev: TelemetryEvent = {
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  const events = readEvents();
  events.push(ev);
  saveEvents(events);
}

export function clearTelemetryEvents() {
  localStorage.removeItem(TELEMETRY_KEY);
}

export function getTelemetryEvents(): TelemetryEvent[] {
  return readEvents();
}
