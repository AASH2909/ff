export const EVENT_NAMESPACE = "controlos";
export const EVENT_SUBJECT_PREFIX = `${EVENT_NAMESPACE}.events`;

export const EVENT_NAMES = [
  "OrderCreated",
  "OrderPaid",
  "OrderCancelled",
  "ShiftOpened",
  "ShiftClosed",
  "InventoryReceived",
  "InventoryWrittenOff",
  "FraudDetected",
  "ControlScoreUpdated",
  "AISummaryGenerated"
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export type CurrencyCode = "USD" | "UZS";

export type MonetaryValue = {
  amount: number;
  currency: CurrencyCode;
};

export type OrderCreatedPayload = {
  orderId: string;
  tenantId: string;
  status: string;
  total: MonetaryValue;
  currency: CurrencyCode;
  createdAt: string;
};

export type OrderPaidPayload = {
  orderId: string;
  tenantId: string;
  amount: MonetaryValue;
  paymentMethod: string;
  paidAt: string;
};

export type OrderCancelledPayload = {
  orderId: string;
  tenantId: string;
  cancelledAt: string;
  reason?: string;
};

export type ShiftOpenedPayload = {
  shiftId: string;
  tenantId: string;
  cashierId: string;
  openingCash: MonetaryValue;
  openedAt: string;
};

export type ShiftClosedPayload = {
  shiftId: string;
  tenantId: string;
  closingCash: MonetaryValue;
  closedAt: string;
};

export type InventoryReceivedPayload = {
  inventoryId: string;
  tenantId: string;
  productId: string;
  quantity: number;
  receivedAt: string;
};

export type InventoryWrittenOffPayload = {
  inventoryId: string;
  tenantId: string;
  productId: string;
  quantity: number;
  writtenOffAt: string;
  reason?: string;
};

export type FraudDetectedPayload = {
  incidentId: string;
  tenantId: string;
  orderId?: string;
  detectedAt: string;
  riskScore: number;
  description: string;
};

export type ControlScoreUpdatedPayload = {
  scoreId: string;
  tenantId: string;
  entityId: string;
  scoreType: string;
  score: number;
  updatedAt: string;
};

export type AISummaryGeneratedPayload = {
  summaryId: string;
  tenantId: string;
  sourceId: string;
  summaryType: string;
  summary: string;
  generatedAt: string;
};

export type EventPayloadMap = {
  OrderCreated: OrderCreatedPayload;
  OrderPaid: OrderPaidPayload;
  OrderCancelled: OrderCancelledPayload;
  ShiftOpened: ShiftOpenedPayload;
  ShiftClosed: ShiftClosedPayload;
  InventoryReceived: InventoryReceivedPayload;
  InventoryWrittenOff: InventoryWrittenOffPayload;
  FraudDetected: FraudDetectedPayload;
  ControlScoreUpdated: ControlScoreUpdatedPayload;
  AISummaryGenerated: AISummaryGeneratedPayload;
};

export type DomainEvent<T extends EventName = EventName> = {
  eventId: string;
  eventName: T;
  eventVersion: number;
  occurredAt: string;
  tenantId: string;
  aggregateId: string;
  correlationId?: string;
  causationId?: string;
  source?: string;
  payload: EventPayloadMap[T];
};

export type EventSubject<T extends EventName = EventName> = `${typeof EVENT_SUBJECT_PREFIX}.${T}`;

export function eventSubject(eventName: EventName): string {
  return `${EVENT_SUBJECT_PREFIX}.${eventName}`;
}

export const EVENT_SCHEMA_VERSION = 1;

export const EVENT_SCHEMAS: { [K in EventName]: Record<string, unknown> } = {
  OrderCreated: {
    type: "object",
    properties: {
      tenantId: { type: "string" },
      orderId: { type: "string" },
      status: { type: "string" },
      total: { type: "object" },
      currency: { type: "string" },
      createdAt: { type: "string", format: "date-time" }
    },
    required: ["tenantId", "orderId", "status", "total", "currency", "createdAt"],
    additionalProperties: false
  },
  OrderPaid: {
    type: "object",
    properties: {
      tenantId: { type: "string" },
      orderId: { type: "string" },
      amount: { type: "object" },
      paymentMethod: { type: "string" },
      paidAt: { type: "string", format: "date-time" }
    },
    required: ["tenantId", "orderId", "amount", "paymentMethod", "paidAt"],
    additionalProperties: false
  },
  OrderCancelled: {
    type: "object",
    properties: {
      tenantId: { type: "string" },
      orderId: { type: "string" },
      cancelledAt: { type: "string", format: "date-time" },
      reason: { type: "string" }
    },
    required: ["tenantId", "orderId", "cancelledAt"],
    additionalProperties: false
  },
  ShiftOpened: {
    type: "object",
    properties: {
      tenantId: { type: "string" },
      shiftId: { type: "string" },
      cashierId: { type: "string" },
      openingCash: { type: "object" },
      openedAt: { type: "string", format: "date-time" }
    },
    required: ["tenantId", "shiftId", "cashierId", "openingCash", "openedAt"],
    additionalProperties: false
  },
  ShiftClosed: {
    type: "object",
    properties: {
      tenantId: { type: "string" },
      shiftId: { type: "string" },
      closingCash: { type: "object" },
      closedAt: { type: "string", format: "date-time" }
    },
    required: ["tenantId", "shiftId", "closingCash", "closedAt"],
    additionalProperties: false
  },
  InventoryReceived: {
    type: "object",
    properties: {
      tenantId: { type: "string" },
      inventoryId: { type: "string" },
      productId: { type: "string" },
      quantity: { type: "number" },
      receivedAt: { type: "string", format: "date-time" }
    },
    required: ["tenantId", "inventoryId", "productId", "quantity", "receivedAt"],
    additionalProperties: false
  },
  InventoryWrittenOff: {
    type: "object",
    properties: {
      tenantId: { type: "string" },
      inventoryId: { type: "string" },
      productId: { type: "string" },
      quantity: { type: "number" },
      writtenOffAt: { type: "string", format: "date-time" },
      reason: { type: "string" }
    },
    required: ["tenantId", "inventoryId", "productId", "quantity", "writtenOffAt"],
    additionalProperties: false
  },
  FraudDetected: {
    type: "object",
    properties: {
      tenantId: { type: "string" },
      incidentId: { type: "string" },
      orderId: { type: "string" },
      detectedAt: { type: "string", format: "date-time" },
      riskScore: { type: "number" },
      description: { type: "string" }
    },
    required: ["tenantId", "incidentId", "detectedAt", "riskScore", "description"],
    additionalProperties: false
  },
  ControlScoreUpdated: {
    type: "object",
    properties: {
      tenantId: { type: "string" },
      scoreId: { type: "string" },
      entityId: { type: "string" },
      scoreType: { type: "string" },
      score: { type: "number" },
      updatedAt: { type: "string", format: "date-time" }
    },
    required: ["tenantId", "scoreId", "entityId", "scoreType", "score", "updatedAt"],
    additionalProperties: false
  },
  AISummaryGenerated: {
    type: "object",
    properties: {
      tenantId: { type: "string" },
      summaryId: { type: "string" },
      sourceId: { type: "string" },
      summaryType: { type: "string" },
      summary: { type: "string" },
      generatedAt: { type: "string", format: "date-time" }
    },
    required: ["tenantId", "summaryId", "sourceId", "summaryType", "summary", "generatedAt"],
    additionalProperties: false
  }
};
