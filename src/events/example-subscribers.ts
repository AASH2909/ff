import type { EventName } from "./contracts";
import type { EventBus, EventHandler, EventSubscription } from "./event-bus";

export interface IdempotencyStore {
  hasProcessed(eventId: string, handlerName: string): Promise<boolean>;
  markProcessed(eventId: string, handlerName: string): Promise<void>;
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly processedKeys = new Set<string>();

  async hasProcessed(eventId: string, handlerName: string): Promise<boolean> {
    return this.processedKeys.has(this.key(eventId, handlerName));
  }

  async markProcessed(eventId: string, handlerName: string): Promise<void> {
    this.processedKeys.add(this.key(eventId, handlerName));
  }

  private key(eventId: string, handlerName: string): string {
    return `${handlerName}:${eventId}`;
  }
}

export async function registerMvpSubscribers(
  bus: EventBus,
  idempotencyStore: IdempotencyStore = new InMemoryIdempotencyStore()
): Promise<EventSubscription[]> {
  return Promise.all([
    subscribeKitchenOrderCreated(bus, idempotencyStore),
    subscribeShiftAccountingOrderPaid(bus, idempotencyStore),
    subscribeInventoryOrderCancelled(bus, idempotencyStore),
    subscribeControlScoreShiftOpened(bus, idempotencyStore),
    subscribeAISummaryShiftClosed(bus, idempotencyStore),
    subscribeControlScoreInventoryReceived(bus, idempotencyStore),
    subscribeFraudInventoryWrittenOff(bus, idempotencyStore),
    subscribeNotificationsFraudDetected(bus, idempotencyStore),
    subscribeDashboardControlScoreUpdated(bus, idempotencyStore),
    subscribeDashboardAISummaryGenerated(bus, idempotencyStore)
  ]);
}

export async function subscribeKitchenOrderCreated(
  bus: EventBus,
  idempotencyStore: IdempotencyStore
): Promise<EventSubscription> {
  return bus.subscribe(
    "OrderCreated",
    idempotent<"OrderCreated">("kitchen.order-created", idempotencyStore, async (event) => {
      console.log("send order to kitchen", event.payload.orderId);
    }),
    standardSubscriberOptions("kitchen-service", "kitchen-order-created")
  );
}

export async function subscribeShiftAccountingOrderPaid(
  bus: EventBus,
  idempotencyStore: IdempotencyStore
): Promise<EventSubscription> {
  return bus.subscribe(
    "OrderPaid",
    idempotent<"OrderPaid">("shift.order-paid", idempotencyStore, async (event) => {
      console.log("add payment to shift ledger", event.payload.orderId, event.payload.amount.amount);
    }),
    standardSubscriberOptions("shift-service", "shift-order-paid")
  );
}

export async function subscribeInventoryOrderCancelled(
  bus: EventBus,
  idempotencyStore: IdempotencyStore
): Promise<EventSubscription> {
  return bus.subscribe(
    "OrderCancelled",
    idempotent<"OrderCancelled">("inventory.order-cancelled", idempotencyStore, async (event) => {
      console.log("release reserved stock", event.payload.orderId);
    }),
    standardSubscriberOptions("inventory-service", "inventory-order-cancelled")
  );
}

export async function subscribeControlScoreShiftOpened(
  bus: EventBus,
  idempotencyStore: IdempotencyStore
): Promise<EventSubscription> {
  return bus.subscribe(
    "ShiftOpened",
    idempotent<"ShiftOpened">("control-score.shift-opened", idempotencyStore, async (event) => {
      console.log("record shift opened signal", event.payload.shiftId);
    }),
    standardSubscriberOptions("control-score-service", "score-shift-opened")
  );
}

export async function subscribeAISummaryShiftClosed(
  bus: EventBus,
  idempotencyStore: IdempotencyStore
): Promise<EventSubscription> {
  return bus.subscribe(
    "ShiftClosed",
    idempotent<"ShiftClosed">("ai-summary.shift-closed", idempotencyStore, async (event) => {
      console.log("schedule shift summary", event.payload.shiftId);
    }),
    standardSubscriberOptions("ai-summary-service", "summary-shift-closed")
  );
}

export async function subscribeControlScoreInventoryReceived(
  bus: EventBus,
  idempotencyStore: IdempotencyStore
): Promise<EventSubscription> {
  return bus.subscribe(
    "InventoryReceived",
    idempotent<"InventoryReceived">("control-score.inventory-received", idempotencyStore, async (event) => {
      console.log("record inventory health signal", event.payload.inventoryId);
    }),
    standardSubscriberOptions("control-score-service", "score-inventory-received")
  );
}

export async function subscribeFraudInventoryWrittenOff(
  bus: EventBus,
  idempotencyStore: IdempotencyStore
): Promise<EventSubscription> {
  return bus.subscribe(
    "InventoryWrittenOff",
    idempotent<"InventoryWrittenOff">("fraud.inventory-written-off", idempotencyStore, async (event) => {
      console.log("evaluate inventory write-off risk", event.payload.inventoryId);
    }),
    standardSubscriberOptions("fraud-service", "fraud-inventory-written-off")
  );
}

export async function subscribeNotificationsFraudDetected(
  bus: EventBus,
  idempotencyStore: IdempotencyStore
): Promise<EventSubscription> {
  return bus.subscribe(
    "FraudDetected",
    idempotent<"FraudDetected">("notifications.fraud-detected", idempotencyStore, async (event) => {
      console.log("notify fraud incident", event.payload.incidentId, event.payload.severity);
    }),
    standardSubscriberOptions("notification-service", "notify-fraud-detected")
  );
}

export async function subscribeDashboardControlScoreUpdated(
  bus: EventBus,
  idempotencyStore: IdempotencyStore
): Promise<EventSubscription> {
  return bus.subscribe(
    "ControlScoreUpdated",
    idempotent<"ControlScoreUpdated">("dashboard.control-score-updated", idempotencyStore, async (event) => {
      console.log("refresh control score read model", event.payload.scoreId);
    }),
    standardSubscriberOptions("dashboard-service", "dashboard-control-score-updated")
  );
}

export async function subscribeDashboardAISummaryGenerated(
  bus: EventBus,
  idempotencyStore: IdempotencyStore
): Promise<EventSubscription> {
  return bus.subscribe(
    "AISummaryGenerated",
    idempotent<"AISummaryGenerated">("dashboard.ai-summary-generated", idempotencyStore, async (event) => {
      console.log("refresh summary read model", event.payload.summaryId);
    }),
    standardSubscriberOptions("dashboard-service", "dashboard-ai-summary-generated")
  );
}

function idempotent<T extends EventName>(
  handlerName: string,
  store: IdempotencyStore,
  handler: EventHandler<T>
): EventHandler<T> {
  return async (event, context) => {
    if (await store.hasProcessed(event.eventId, handlerName)) {
      return;
    }

    await handler(event, context);
    await store.markProcessed(event.eventId, handlerName);
  };
}

function standardSubscriberOptions(queueGroup: string, durableName: string) {
  return {
    queueGroup,
    durableName,
    handlerName: durableName,
    retryStrategy: {
      maxAttempts: 5,
      baseDelayMs: 500,
      maxDelayMs: 15_000,
      backoffMultiplier: 2,
      jitter: true
    }
  };
}
