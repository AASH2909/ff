import type { DomainEvent, EventName } from "./contracts";

export type EventHandler<T extends EventName = EventName> = (
  event: DomainEvent<T>
) => Promise<void> | void;

export type SubscriberOptions = {
  queueGroup?: string;
  durableName?: string;
  maxRetries?: number;
  retryDelayMs?: number;
};

export interface EventSubscription {
  unsubscribe(): Promise<void>;
}

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe<T extends EventName>(
    eventName: T,
    handler: EventHandler<T>,
    options?: SubscriberOptions
  ): Promise<EventSubscription>;
}

type SubscriptionRecord<T extends EventName> = {
  handler: EventHandler<T>;
  options: SubscriberOptions;
};

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<EventName, Array<SubscriptionRecord<EventName>>>();

  async publish(event: DomainEvent): Promise<void> {
    const subscribers = this.handlers.get(event.eventName) ?? [];

    for (const subscription of subscribers) {
      await this.executeWithRetry(subscription, event);
    }
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
    const subscription: SubscriptionRecord<T> = { handler, options };
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(subscription as SubscriptionRecord<EventName>);
    this.handlers.set(eventName, existing);

    return {
      unsubscribe: async () => {
        const current = this.handlers.get(eventName) ?? [];
        this.handlers.set(
          eventName,
          current.filter((entry) => entry !== subscription)
        );
      }
    };
  }

  private async executeWithRetry(
    subscription: SubscriptionRecord<EventName>,
    event: DomainEvent
  ): Promise<void> {
    const maxRetries = subscription.options.maxRetries ?? 3;
    const retryDelayMs = subscription.options.retryDelayMs ?? 500;

    let attempt = 0;

    while (true) {
      try {
        await subscription.handler(event as DomainEvent<EventName>);
        return;
      } catch (error) {
        attempt += 1;

        if (attempt > maxRetries) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }
}
