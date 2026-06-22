import type { DomainEvent, EventName } from "./contracts";
import { deserializeEvent, eventSubject, serializeEvent } from "./event";
import type { EventBus, EventSubscription, EventHandler, SubscriberOptions } from "./event-bus";

export interface NatsMessage {
  data: Uint8Array;
  subject: string;
  headers?: Record<string, string>;
  ack?(): Promise<void>;
}

export interface NatsSubscription extends AsyncIterable<NatsMessage> {
  unsubscribe(): Promise<void>;
}

export interface NatsClient {
  publish(subject: string, data: Uint8Array, options?: { headers?: Record<string, string> }): Promise<void>;
  subscribe(subject: string, options?: { queue?: string; durable?: string }): NatsSubscription;
  close(): Promise<void>;
}

export class NatsEventBus implements EventBus {
  constructor(private readonly client: NatsClient) {}

  async publish(event: DomainEvent): Promise<void> {
    const subject = eventSubject(event.eventName);
    const payload = serializeEvent(event);
    const data = new TextEncoder().encode(payload);

    await this.client.publish(subject, data, {
      headers: {
        "ce-type": event.eventName,
        "ce-source": event.source ?? "controlos.application",
        "ce-id": event.eventId,
        "ce-time": event.occurredAt,
        "ce-specversion": "1.0"
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
    const subject = eventSubject(eventName);
    const subscription = this.client.subscribe(subject, {
      queue: options.queueGroup,
      durable: options.durableName
    });

    const consumer = this.dispatch(subscription, handler, options);

    return {
      unsubscribe: async () => {
        await consumer;
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
      try {
        const event = deserializeEvent(new TextDecoder().decode(message.data)) as DomainEvent<T>;
        await handler(event);
        await message.ack?.();
      } catch (error) {
        if (options.maxRetries && options.maxRetries > 0) {
          // NATS JetStream should handle redelivery when ack is omitted or NAK is returned.
        }
      }
    }
  }
}
