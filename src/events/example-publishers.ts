import type { EventBus } from "./event-bus";
import { createEvent } from "./event";

export async function publishOrderCreated(
  bus: EventBus,
  tenantId: string,
  orderId: string,
  amount: number,
  currency: "USD" | "UZS"
) {
  const event = createEvent({
    eventName: "OrderCreated",
    tenantId,
    aggregateId: orderId,
    payload: {
      orderId,
      tenantId,
      status: "open",
      total: { amount, currency },
      currency,
      createdAt: new Date().toISOString()
    }
  });

  await bus.publish(event);
}

export async function publishOrderPaid(
  bus: EventBus,
  tenantId: string,
  orderId: string,
  amount: number,
  currency: "USD" | "UZS",
  paymentMethod: string
) {
  const event = createEvent({
    eventName: "OrderPaid",
    tenantId,
    aggregateId: orderId,
    payload: {
      orderId,
      tenantId,
      amount: { amount, currency },
      paymentMethod,
      paidAt: new Date().toISOString()
    }
  });

  await bus.publish(event);
}
