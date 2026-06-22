import type { EventBus } from "./event-bus";
import type { EventSubscription } from "./event-bus";

export async function subscribeOrderCreated(bus: EventBus): Promise<EventSubscription> {
  return bus.subscribe(
    "OrderCreated",
    async (event) => {
      console.log("order created event", event.payload.orderId);
      // update read models, analytics, or order tracking state
    },
    {
      queueGroup: "order-service",
      durableName: "order-created-consumer",
      maxRetries: 5,
      retryDelayMs: 1000
    }
  );
}

export async function subscribeFraudDetected(bus: EventBus): Promise<EventSubscription> {
  return bus.subscribe(
    "FraudDetected",
    async (event) => {
      console.log("fraud detected", event.payload.incidentId, event.payload.riskScore);
      // notify downstream fraud workflows or alerts
    },
    {
      queueGroup: "fraud-service",
      durableName: "fraud-detected-consumer",
      maxRetries: 3,
      retryDelayMs: 1500
    }
  );
}
