import {
  EVENT_SCHEMA_VERSION,
  EVENT_SCHEMAS,
  eventSubject,
  isEventName,
  type DomainEvent,
  type EventName,
  type JsonSchema
} from "./contracts";

export type CreateEventInput<T extends EventName> =
  Omit<DomainEvent<T>, "eventId" | "eventVersion" | "occurredAt"> & {
    eventId?: string;
    eventVersion?: number;
    occurredAt?: string;
  };

export type EventValidationIssue = {
  path: string;
  message: string;
};

export class EventValidationError extends Error {
  constructor(public readonly issues: EventValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "));
    this.name = "EventValidationError";
  }
}

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEvent<T extends EventName>(event: CreateEventInput<T>): DomainEvent<T> {
  const created: DomainEvent<T> = {
    ...event,
    eventId: event.eventId ?? randomId(),
    eventVersion: event.eventVersion ?? EVENT_SCHEMA_VERSION,
    occurredAt: event.occurredAt ?? new Date().toISOString(),
    source: event.source ?? "controlos.application"
  };

  assertValidEvent(created);

  return created;
}

export function validateEvent(event: DomainEvent): EventValidationIssue[] {
  const issues: EventValidationIssue[] = [];

  if (!event || typeof event !== "object") {
    return [{ path: "$", message: "Event envelope must be an object." }];
  }

  if (!isNonEmptyString(event.eventId)) {
    issues.push({ path: "$.eventId", message: "Event id is required." });
  }

  if (!isEventName(event.eventName)) {
    issues.push({ path: "$.eventName", message: "Event name is not supported." });
    return issues;
  }

  if (event.eventVersion !== EVENT_SCHEMA_VERSION) {
    issues.push({
      path: "$.eventVersion",
      message: `Event version must be ${EVENT_SCHEMA_VERSION}.`
    });
  }

  if (!isDateTimeString(event.occurredAt)) {
    issues.push({ path: "$.occurredAt", message: "Occurred time must be ISO date-time." });
  }

  if (!isNonEmptyString(event.tenantId)) {
    issues.push({ path: "$.tenantId", message: "Tenant id is required." });
  }

  if (!isNonEmptyString(event.aggregateId)) {
    issues.push({ path: "$.aggregateId", message: "Aggregate id is required." });
  }

  if (!event.payload || typeof event.payload !== "object") {
    issues.push({ path: "$.payload", message: "Payload is required." });
    return issues;
  }

  const payloadTenantId = readProperty(event.payload, "tenantId");

  if (payloadTenantId !== event.tenantId) {
    issues.push({
      path: "$.payload.tenantId",
      message: "Payload tenant id must match envelope tenant id."
    });
  }

  issues.push(...validateBySchema(EVENT_SCHEMAS[event.eventName], event.payload, "$.payload"));

  return issues;
}

export function assertValidEvent(event: DomainEvent): void {
  const issues = validateEvent(event);

  if (issues.length > 0) {
    throw new EventValidationError(issues);
  }
}

export function serializeEvent(event: DomainEvent): string {
  assertValidEvent(event);
  return JSON.stringify(event);
}

export function deserializeEvent(raw: string): DomainEvent {
  const event = JSON.parse(raw) as DomainEvent;
  assertValidEvent(event);
  return event;
}

export function subjectForEvent(eventName: EventName): string {
  return eventSubject(eventName);
}

function validateBySchema(schema: JsonSchema, value: unknown, path: string): EventValidationIssue[] {
  const issues: EventValidationIssue[] = [];

  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return [{ path, message: "Expected object." }];
    }

    const record = value as Record<string, unknown>;

    for (const requiredField of schema.required ?? []) {
      if (record[requiredField] === undefined || record[requiredField] === null) {
        issues.push({ path: `${path}.${requiredField}`, message: "Field is required." });
      }
    }

    for (const [propertyName, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (record[propertyName] !== undefined && record[propertyName] !== null) {
        issues.push(...validateBySchema(propertySchema, record[propertyName], `${path}.${propertyName}`));
      }
    }

    if (schema.additionalProperties === false) {
      const allowedProperties = new Set(Object.keys(schema.properties ?? {}));

      for (const propertyName of Object.keys(record)) {
        if (!allowedProperties.has(propertyName)) {
          issues.push({
            path: `${path}.${propertyName}`,
            message: "Additional property is not allowed."
          });
        }
      }
    }

    return issues;
  }

  if (schema.type === "string") {
    if (typeof value !== "string") {
      return [{ path, message: "Expected string." }];
    }

    if (schema.enum && !schema.enum.includes(value)) {
      return [{ path, message: `Expected one of: ${schema.enum.join(", ")}.` }];
    }

    if (schema.minLength !== undefined && value.trim().length < schema.minLength) {
      return [{ path, message: `Expected at least ${schema.minLength} character(s).` }];
    }

    if (schema.format === "date-time" && !isDateTimeString(value)) {
      return [{ path, message: "Expected ISO date-time string." }];
    }

    return issues;
  }

  if (schema.type === "integer") {
    if (!Number.isInteger(value)) {
      return [{ path, message: "Expected integer." }];
    }

    return validateNumberBounds(schema, value as number, path);
  }

  if (schema.type === "number") {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return [{ path, message: "Expected number." }];
    }

    return validateNumberBounds(schema, value, path);
  }

  return issues;
}

function validateNumberBounds(schema: JsonSchema, value: number, path: string): EventValidationIssue[] {
  const issues: EventValidationIssue[] = [];

  if (schema.minimum !== undefined && value < schema.minimum) {
    issues.push({ path, message: `Expected value greater than or equal to ${schema.minimum}.` });
  }

  if (schema.maximum !== undefined && value > schema.maximum) {
    issues.push({ path, message: `Expected value less than or equal to ${schema.maximum}.` });
  }

  return issues;
}

function readProperty(value: unknown, property: string): unknown {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return (value as Record<string, unknown>)[property];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isDateTimeString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}
