import {
  EVENT_SCHEMA_VERSION,
  EVENT_STREAM_NAME,
  EVENT_STREAM_SUBJECT,
  INVALID_EVENT_DEAD_LETTER_SUBJECT,
  type DomainEvent,
  type EventName
} from "./contracts";
import { createDeadLetterEnvelope, errorToMessage, type DeadLetterPublisher } from "./dead-letter";
import { deserializeEvent, serializeEvent, subjectForEvent } from "./event";
import type { EventBus, EventSubscription, EventHandler, SubscriberOptions } from "./event-bus";
import { calculateRetryDelay, resolveRetryStrategy } from "./event-bus";

export type NatsHeaders = Record<string, string>;

export interface NatsMessage {
  data: Uint8Array;
  subject: string;
  headers?: NatsHeaders;
  deliveryAttempt?: number;
  ack?(): Promise<void>;
  nak?(delayMs?: number): Promise<void>;
  term?(): Promise<void>;
}

export interface NatsSubscription extends AsyncIterable<NatsMessage> {
  unsubscribe(): Promise<void>;
}

export interface NatsClient {
  publish(subject: string, data: Uint8Array, options?: { headers?: NatsHeaders }): Promise<void>;
  subscribe(
    subject: string,
    options?: {
      queue?: string;
      durable?: string;
      manualAck?: boolean;
      ackWaitMs?: number;
      maxDeliver?: number;
    }
  ): NatsSubscription;
  close(): Promise<void>;
}

export type NatsEventBusOptions = {
  source?: string;
  deadLetterPublisher?: DeadLetterPublisher;
};

export const NATS_EVENT_STREAM_CONFIG = {
  name: EVENT_STREAM_NAME,
  subjects: [EVENT_STREAM_SUBJECT],
  retention: "limits",
  storage: "file",
  discard: "old",
  duplicateWindowMs: 120_000
} as const;

export class NatsEventBus implements EventBus {
  constructor(
    private readonly client: NatsClient,
    private readonly options: NatsEventBusOptions = {}
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    const subject = subjectForEvent(event.eventName);
    const payload = serializeEvent(event);
    const data = new TextEncoder().encode(payload);

    await this.client.publish(subject, data, {
      headers: {
        "ce-specversion": "1.0",
        "ce-type": event.eventName,
        "ce-source": event.source ?? this.options.source ?? "controlos.application",
        "ce-id": event.eventId,
        "ce-time": event.occurredAt,
        "ce-subject": event.aggregateId,
        "controlos-tenant-id": event.tenantId,
        "controlos-event-version": String(event.eventVersion),
        "controlos-schema-version": String(EVENT_SCHEMA_VERSION),
        ...(event.correlationId ? { "controlos-correlation-id": event.correlationId } : {}),
        ...(event.causationId ? { "controlos-causation-id": event.causationId } : {})
      }
    });
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  async subscribe<T extends EventName>(
    eventName: T,
    handler: EventHandler<T>,
    options: SubscriberOptions = {}
  ): Promise<EventSubscription> {
    const subject = subjectForEvent(eventName);
    const retryStrategy = resolveRetryStrategy(options);
    const subscription = this.client.subscribe(subject, {
      queue: options.queueGroup,
      durable: options.durableName,
      manualAck: true,
      maxDeliver: retryStrategy.maxAttempts
    });

    void this.dispatch(subscription, handler, options);

    return {
      unsubscribe: async () => {
        await subscription.unsubscribe();
      }
    };
  }

  private async dispatch<T extends EventName>(
    subscription: NatsSubscription,
    handler: EventHandler<T>,
    options: SubscriberOptions
  ): Promise<void> {
    for await (const message of subscription) {
      const retryStrategy = resolveRetryStrategy(options);
      const attempt = message.deliveryAttempt ?? readDeliveryAttempt(message.headers) ?? 1;
      let event: DomainEvent<T> | null = null;

      try {
        event = deserializeEvent(new TextDecoder().decode(message.data)) as DomainEvent<T>;
        await handler(event, {
          attempt,
          maxAttempts: retryStrategy.maxAttempts,
          subject: message.subject,
          queueGroup: options.queueGroup,
          durableName: options.durableName
        });
        await message.ack?.();
      } catch (error) {
        if (!event) {
          await this.publishInvalidMessageDeadLetter(message, error);
          await message.term?.();
          await message.ack?.();
          continue;
        }

        const classification =
          options.classifyError?.(error, event, {
            attempt,
            maxAttempts: retryStrategy.maxAttempts,
            subject: message.subject,
            queueGroup: options.queueGroup,
            durableName: options.durableName
          }) ?? "retryable";

        if (classification === "non_retryable" || attempt >= retryStrategy.maxAttempts) {
          await this.publishDomainEventDeadLetter(
            event,
            message.subject,
            error,
            attempt,
            classification === "non_retryable" ? "non_retryable" : "retry_exhausted",
            options
          );
          await message.term?.();
          await message.ack?.();
          continue;
        }

        await message.nak?.(calculateRetryDelay(retryStrategy, attempt));
      }
    }
  }

  private async publishDomainEventDeadLetter<T extends EventName>(
    event: DomainEvent<T>,
    failedSubject: string,
    error: unknown,
    attempts: number,
    reason: "non_retryable" | "retry_exhausted",
    options: SubscriberOptions
  ): Promise<void> {
    const deadLetterPublisher = options.deadLetterPublisher ?? this.options.deadLetterPublisher;
    const deadLetter = createDeadLetterEnvelope({
      event,
      failedSubject,
      reason,
      attempts,
      error,
      handlerName: options.handlerName,
      queueGroup: options.queueGroup,
      durableName: options.durableName
    });

    if (deadLetterPublisher) {
      await deadLetterPublisher.publish(deadLetter);
      return;
    }

    await this.client.publish(
      deadLetter.deadLetterSubject,
      new TextEncoder().encode(JSON.stringify(deadLetter)),
      {
        headers: {
          "ce-specversion": "1.0",
          "ce-type": `${event.eventName}DeadLetter`,
          "ce-source": this.options.source ?? "controlos.events",
          "ce-id": `dlq-${Date.now()}`,
          "ce-time": deadLetter.failedAt,
          "controlos-tenant-id": event.tenantId,
          "controlos-original-event-id": event.eventId
        }
      }
    );
  }

  private async publishInvalidMessageDeadLetter(
    message: NatsMessage,
    error: unknown
  ): Promise<void> {
    const payload = {
      failedSubject: message.subject,
      deadLetterSubject: INVALID_EVENT_DEAD_LETTER_SUBJECT,
      reason: "deserialization_failed",
      attempts: message.deliveryAttempt ?? readDeliveryAttempt(message.headers) ?? 1,
      failedAt: new Date().toISOString(),
      errorMessage: errorToMessage(error),
      rawMessage: new TextDecoder().decode(message.data)
    };

    await this.client.publish(
      INVALID_EVENT_DEAD_LETTER_SUBJECT,
      new TextEncoder().encode(JSON.stringify(payload)),
      {
        headers: {
          "ce-specversion": "1.0",
          "ce-type": "InvalidEventDeadLetter",
          "ce-source": this.options.source ?? "controlos.events",
          "ce-id": `dlq-${Date.now()}`,
          "ce-time": payload.failedAt
        }
      }
    );
  }
}

function readDeliveryAttempt(headers: NatsHeaders | undefined): number | null {
  const rawAttempt = headers?.["Nats-Delivery-Attempt"] ?? headers?.["nats-delivery-attempt"];

  if (!rawAttempt) {
    return null;
  }

  const parsed = Number(rawAttempt);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
