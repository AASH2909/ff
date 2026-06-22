import { EVENT_SCHEMA_VERSION, eventSubject, type DomainEvent, type EventName } from "./contracts";

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEvent<T extends EventName>(event: Omit<DomainEvent<T>, "eventId" | "eventVersion" | "occurredAt">): DomainEvent<T> {
  return {
    ...event,
    eventId: randomId(),
    eventVersion: EVENT_SCHEMA_VERSION,
    occurredAt: new Date().toISOString(),
    source: event.source ?? "controlos.application"
  };
}

export function serializeEvent(event: DomainEvent): string {
  return JSON.stringify(event);
}

export function deserializeEvent(raw: string): DomainEvent {
  return JSON.parse(raw) as DomainEvent;
}

export function subjectForEvent(eventName: EventName): string {
  return eventSubject(eventName);
}
