import type { DomainEvent, EventName } from "./contracts";
import type { DeadLetterPublisher, DeadLetterReason } from "./dead-letter";
import { createDeadLetterEnvelope } from "./dead-letter";
import { assertValidEvent, subjectForEvent } from "./event";

export type EventHandlerContext = {
  attempt: number;
  maxAttempts: number;
  subject: string;
  queueGroup?: string;
  durableName?: string;
};

export type EventHandler<T extends EventName = EventName> = (
  event: DomainEvent<T>,
  context: EventHandlerContext
) => Promise<void> | void;

export type RetryStrategy = {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
};

export type EventErrorClassification = "retryable" | "non_retryable";

export type SubscriberOptions = {
  queueGroup?: string;
  durableName?: string;
  handlerName?: string;
  maxRetries?: number;
  retryDelayMs?: number;
  retryStrategy?: RetryStrategy;
  deadLetterPublisher?: DeadLetterPublisher;
  classifyError?: (
    error: unknown,
    event: DomainEvent,
    context: EventHandlerContext
  ) => EventErrorClassification;
};

export type EventBusOptions = {
  validateEvents?: boolean;
  deadLetterPublisher?: DeadLetterPublisher;
};

export interface EventSubscription {
  unsubscribe(): Promise<void>;
}

export interface EventBus {
  publish<T extends EventName>(event: DomainEvent<T>): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe<T extends EventName>(
    eventName: T,
    handler: EventHandler<T>,
    options?: SubscriberOptions
  ): Promise<EventSubscription>;
}

type SubscriptionRecord<T extends EventName> = {
  eventName: T;
  handler: EventHandler<T>;
  options: SubscriberOptions;
};

type SubscriptionRegistry = {
  [T in EventName]: Array<SubscriptionRecord<T>>;
};

export class InMemoryEventBus implements EventBus {
  private handlers: SubscriptionRegistry = {
    OrderCreated: [],
    OrderPaid: [],
    OrderCancelled: [],
    ShiftOpened: [],
    ShiftClosed: [],
    InventoryReceived: [],
    InventoryWrittenOff: [],
    FraudDetected: [],
    ControlScoreUpdated: [],
    AISummaryGenerated: []
  };
  private queueGroupOffsets = new Map<string, number>();

  constructor(private readonly options: EventBusOptions = {}) {}

  async publish<T extends EventName>(event: DomainEvent<T>): Promise<void> {
    if (this.options.validateEvents ?? true) {
      assertValidEvent(event);
    }

    const subscribers = this.handlers[event.eventName];
    const deliveries = this.selectDeliveries(event.eventName, subscribers);

    await Promise.all(
      deliveries.map((subscription) => {
        return this.executeWithRetry(subscription, event);
      })
    );
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
    const subscription: SubscriptionRecord<T> = { eventName, handler, options };
    const existing = this.handlers[eventName];
    existing.push(subscription);

    return {
      unsubscribe: async () => {
        const current = this.handlers[eventName];
        const subscriptionIndex = current.indexOf(subscription);

        if (subscriptionIndex >= 0) {
          current.splice(subscriptionIndex, 1);
        }
      }
    };
  }

  private selectDeliveries<T extends EventName>(
    eventName: T,
    subscriptions: Array<SubscriptionRecord<T>>
  ): Array<SubscriptionRecord<T>> {
    const directDeliveries: Array<SubscriptionRecord<T>> = [];
    const queueGroups = new Map<string, Array<SubscriptionRecord<T>>>();

    for (const subscription of subscriptions) {
      const queueGroup = subscription.options.queueGroup;

      if (!queueGroup) {
        directDeliveries.push(subscription);
        continue;
      }

      const existing = queueGroups.get(queueGroup) ?? [];
      existing.push(subscription);
      queueGroups.set(queueGroup, existing);
    }

    for (const [queueGroup, groupedSubscriptions] of queueGroups.entries()) {
      const offsetKey = `${eventName}:${queueGroup}`;
      const offset = this.queueGroupOffsets.get(offsetKey) ?? 0;
      const selected = groupedSubscriptions[offset % groupedSubscriptions.length];

      if (selected) {
        directDeliveries.push(selected);
        this.queueGroupOffsets.set(offsetKey, offset + 1);
      }
    }

    return directDeliveries;
  }

  private async executeWithRetry<T extends EventName>(
    subscription: SubscriptionRecord<T>,
    event: DomainEvent<T>
  ): Promise<void> {
    const retryStrategy = resolveRetryStrategy(subscription.options);
    const subject = subjectForEvent(event.eventName);
    let attempt = 1;

    while (attempt <= retryStrategy.maxAttempts) {
      const context: EventHandlerContext = {
        attempt,
        maxAttempts: retryStrategy.maxAttempts,
        subject,
        queueGroup: subscription.options.queueGroup,
        durableName: subscription.options.durableName
      };

      try {
        await subscription.handler(event, context);
        return;
      } catch (error) {
        const classification =
          subscription.options.classifyError?.(error, event, context) ?? "retryable";

        if (classification === "non_retryable") {
          await this.publishDeadLetter(subscription, event, error, attempt, "non_retryable");
          return;
        }

        if (attempt >= retryStrategy.maxAttempts) {
          await this.publishDeadLetter(subscription, event, error, attempt, "retry_exhausted");
          return;
        }

        await delay(calculateRetryDelay(retryStrategy, attempt));
        attempt += 1;
      }
    }
  }

  private async publishDeadLetter<T extends EventName>(
    subscription: SubscriptionRecord<T>,
    event: DomainEvent<T>,
    error: unknown,
    attempts: number,
    reason: DeadLetterReason
  ): Promise<void> {
    const deadLetterPublisher =
      subscription.options.deadLetterPublisher ?? this.options.deadLetterPublisher;

    if (!deadLetterPublisher) {
      throw error;
    }

    await deadLetterPublisher.publish(
      createDeadLetterEnvelope({
        event,
        failedSubject: subjectForEvent(event.eventName),
        reason,
        attempts,
        error,
        handlerName: subscription.options.handlerName,
        queueGroup: subscription.options.queueGroup,
        durableName: subscription.options.durableName
      })
    );
  }
}

export function resolveRetryStrategy(options: SubscriberOptions): Required<RetryStrategy> {
  const maxAttempts = options.retryStrategy?.maxAttempts ?? (options.maxRetries ?? 3) + 1;

  return {
    maxAttempts,
    baseDelayMs: options.retryStrategy?.baseDelayMs ?? options.retryDelayMs ?? 500,
    maxDelayMs: options.retryStrategy?.maxDelayMs ?? 30_000,
    backoffMultiplier: options.retryStrategy?.backoffMultiplier ?? 2,
    jitter: options.retryStrategy?.jitter ?? true
  };
}

export function calculateRetryDelay(strategy: Required<RetryStrategy>, attempt: number): number {
  const exponentialDelay =
    strategy.baseDelayMs * strategy.backoffMultiplier ** Math.max(0, attempt - 1);
  const boundedDelay = Math.min(exponentialDelay, strategy.maxDelayMs);

  if (!strategy.jitter) {
    return boundedDelay;
  }

  return Math.round(boundedDelay * (0.5 + Math.random() * 0.5));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
