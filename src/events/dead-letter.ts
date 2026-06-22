import type { DomainEvent, EventName } from "./contracts";
import { deadLetterSubject } from "./contracts";

export type DeadLetterReason =
  | "handler_failed"
  | "validation_failed"
  | "deserialization_failed"
  | "retry_exhausted"
  | "non_retryable";

export type DeadLetterEnvelope<T extends EventName = EventName> = {
  originalEvent: DomainEvent<T>;
  failedSubject: string;
  deadLetterSubject: string;
  reason: DeadLetterReason;
  attempts: number;
  failedAt: string;
  errorMessage: string;
  handlerName?: string;
  queueGroup?: string;
  durableName?: string;
};

export interface DeadLetterPublisher {
  publish<T extends EventName>(deadLetter: DeadLetterEnvelope<T>): Promise<void>;
}

export class InMemoryDeadLetterPublisher implements DeadLetterPublisher {
  private readonly records: DeadLetterEnvelope[] = [];

  async publish<T extends EventName>(deadLetter: DeadLetterEnvelope<T>): Promise<void> {
    this.records.push(deadLetter);
  }

  all(): DeadLetterEnvelope[] {
    return [...this.records];
  }

  clear(): void {
    this.records.length = 0;
  }
}

export function createDeadLetterEnvelope<T extends EventName>(input: {
  event: DomainEvent<T>;
  failedSubject: string;
  reason: DeadLetterReason;
  attempts: number;
  error: unknown;
  handlerName?: string;
  queueGroup?: string;
  durableName?: string;
}): DeadLetterEnvelope<T> {
  return {
    originalEvent: input.event,
    failedSubject: input.failedSubject,
    deadLetterSubject: deadLetterSubject(input.event.eventName),
    reason: input.reason,
    attempts: input.attempts,
    failedAt: new Date().toISOString(),
    errorMessage: errorToMessage(input.error),
    handlerName: input.handlerName,
    queueGroup: input.queueGroup,
    durableName: input.durableName
  };
}

export function errorToMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown event handler error.";
}
