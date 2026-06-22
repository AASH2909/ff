import type {
  AISummaryType,
  ControlScoreType,
  CurrencyCode,
  FraudSeverity,
  MonetaryValue,
  OrderStatus,
  PaymentMethod
} from "./contracts";
import { createEvent } from "./event";
import type { EventBus } from "./event-bus";

type PublisherContext = {
  tenantId: string;
  correlationId?: string;
  causationId?: string;
  occurredAt?: string;
};

function now(occurredAt?: string): string {
  return occurredAt ?? new Date().toISOString();
}

export async function publishOrderCreated(
  bus: EventBus,
  context: PublisherContext,
  input: {
    orderId: string;
    status: OrderStatus;
    total: MonetaryValue;
    currency: CurrencyCode;
  }
): Promise<void> {
  const occurredAt = now(context.occurredAt);

  await bus.publish(
    createEvent({
      eventName: "OrderCreated",
      tenantId: context.tenantId,
      aggregateId: input.orderId,
      correlationId: context.correlationId,
      causationId: context.causationId,
      occurredAt,
      payload: {
        orderId: input.orderId,
        tenantId: context.tenantId,
        status: input.status,
        total: input.total,
        currency: input.currency,
        createdAt: occurredAt
      }
    })
  );
}

export async function publishOrderPaid(
  bus: EventBus,
  context: PublisherContext,
  input: {
    orderId: string;
    amount: MonetaryValue;
    paymentMethod: PaymentMethod;
  }
): Promise<void> {
  const occurredAt = now(context.occurredAt);

  await bus.publish(
    createEvent({
      eventName: "OrderPaid",
      tenantId: context.tenantId,
      aggregateId: input.orderId,
      correlationId: context.correlationId,
      causationId: context.causationId,
      occurredAt,
      payload: {
        orderId: input.orderId,
        tenantId: context.tenantId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        paidAt: occurredAt
      }
    })
  );
}

export async function publishOrderCancelled(
  bus: EventBus,
  context: PublisherContext,
  input: {
    orderId: string;
    reason?: string;
  }
): Promise<void> {
  const occurredAt = now(context.occurredAt);

  await bus.publish(
    createEvent({
      eventName: "OrderCancelled",
      tenantId: context.tenantId,
      aggregateId: input.orderId,
      correlationId: context.correlationId,
      causationId: context.causationId,
      occurredAt,
      payload: {
        orderId: input.orderId,
        tenantId: context.tenantId,
        cancelledAt: occurredAt,
        reason: input.reason
      }
    })
  );
}

export async function publishShiftOpened(
  bus: EventBus,
  context: PublisherContext,
  input: {
    shiftId: string;
    cashierId: string;
    openingCash: MonetaryValue;
  }
): Promise<void> {
  const occurredAt = now(context.occurredAt);

  await bus.publish(
    createEvent({
      eventName: "ShiftOpened",
      tenantId: context.tenantId,
      aggregateId: input.shiftId,
      correlationId: context.correlationId,
      causationId: context.causationId,
      occurredAt,
      payload: {
        shiftId: input.shiftId,
        tenantId: context.tenantId,
        cashierId: input.cashierId,
        openingCash: input.openingCash,
        openedAt: occurredAt
      }
    })
  );
}

export async function publishShiftClosed(
  bus: EventBus,
  context: PublisherContext,
  input: {
    shiftId: string;
    closingCash: MonetaryValue;
  }
): Promise<void> {
  const occurredAt = now(context.occurredAt);

  await bus.publish(
    createEvent({
      eventName: "ShiftClosed",
      tenantId: context.tenantId,
      aggregateId: input.shiftId,
      correlationId: context.correlationId,
      causationId: context.causationId,
      occurredAt,
      payload: {
        shiftId: input.shiftId,
        tenantId: context.tenantId,
        closingCash: input.closingCash,
        closedAt: occurredAt
      }
    })
  );
}

export async function publishInventoryReceived(
  bus: EventBus,
  context: PublisherContext,
  input: {
    inventoryId: string;
    productId: string;
    quantity: number;
  }
): Promise<void> {
  const occurredAt = now(context.occurredAt);

  await bus.publish(
    createEvent({
      eventName: "InventoryReceived",
      tenantId: context.tenantId,
      aggregateId: input.inventoryId,
      correlationId: context.correlationId,
      causationId: context.causationId,
      occurredAt,
      payload: {
        inventoryId: input.inventoryId,
        tenantId: context.tenantId,
        productId: input.productId,
        quantity: input.quantity,
        receivedAt: occurredAt
      }
    })
  );
}

export async function publishInventoryWrittenOff(
  bus: EventBus,
  context: PublisherContext,
  input: {
    inventoryId: string;
    productId: string;
    quantity: number;
    reason?: string;
  }
): Promise<void> {
  const occurredAt = now(context.occurredAt);

  await bus.publish(
    createEvent({
      eventName: "InventoryWrittenOff",
      tenantId: context.tenantId,
      aggregateId: input.inventoryId,
      correlationId: context.correlationId,
      causationId: context.causationId,
      occurredAt,
      payload: {
        inventoryId: input.inventoryId,
        tenantId: context.tenantId,
        productId: input.productId,
        quantity: input.quantity,
        writtenOffAt: occurredAt,
        reason: input.reason
      }
    })
  );
}

export async function publishFraudDetected(
  bus: EventBus,
  context: PublisherContext,
  input: {
    incidentId: string;
    riskScore: number;
    severity: FraudSeverity;
    description: string;
    orderId?: string;
    employeeId?: string;
  }
): Promise<void> {
  const occurredAt = now(context.occurredAt);

  await bus.publish(
    createEvent({
      eventName: "FraudDetected",
      tenantId: context.tenantId,
      aggregateId: input.incidentId,
      correlationId: context.correlationId,
      causationId: context.causationId,
      occurredAt,
      payload: {
        incidentId: input.incidentId,
        tenantId: context.tenantId,
        orderId: input.orderId,
        employeeId: input.employeeId,
        detectedAt: occurredAt,
        riskScore: input.riskScore,
        severity: input.severity,
        description: input.description
      }
    })
  );
}

export async function publishControlScoreUpdated(
  bus: EventBus,
  context: PublisherContext,
  input: {
    scoreId: string;
    entityId: string;
    scoreType: ControlScoreType;
    score: number;
    previousScore?: number;
  }
): Promise<void> {
  const occurredAt = now(context.occurredAt);

  await bus.publish(
    createEvent({
      eventName: "ControlScoreUpdated",
      tenantId: context.tenantId,
      aggregateId: input.scoreId,
      correlationId: context.correlationId,
      causationId: context.causationId,
      occurredAt,
      payload: {
        scoreId: input.scoreId,
        tenantId: context.tenantId,
        entityId: input.entityId,
        scoreType: input.scoreType,
        score: input.score,
        previousScore: input.previousScore,
        updatedAt: occurredAt
      }
    })
  );
}

export async function publishAISummaryGenerated(
  bus: EventBus,
  context: PublisherContext,
  input: {
    summaryId: string;
    sourceId: string;
    summaryType: AISummaryType;
    summary: string;
  }
): Promise<void> {
  const occurredAt = now(context.occurredAt);

  await bus.publish(
    createEvent({
      eventName: "AISummaryGenerated",
      tenantId: context.tenantId,
      aggregateId: input.summaryId,
      correlationId: context.correlationId,
      causationId: context.causationId,
      occurredAt,
      payload: {
        summaryId: input.summaryId,
        tenantId: context.tenantId,
        sourceId: input.sourceId,
        summaryType: input.summaryType,
        summary: input.summary,
        generatedAt: occurredAt
      }
    })
  );
}
