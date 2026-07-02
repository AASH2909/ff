export const EVENT_NAMESPACE = "controlos";
export const EVENT_SCHEMA_VERSION = 1;
export const EVENT_SUBJECT_PREFIX = `${EVENT_NAMESPACE}.events.v${EVENT_SCHEMA_VERSION}`;
export const EVENT_STREAM_NAME = "CONTROL_OS_EVENTS";
export const EVENT_STREAM_SUBJECT = `${EVENT_SUBJECT_PREFIX}.>`;
export const DEAD_LETTER_SUBJECT_PREFIX = `${EVENT_NAMESPACE}.dlq.v${EVENT_SCHEMA_VERSION}`;
export const INVALID_EVENT_DEAD_LETTER_SUBJECT = `${DEAD_LETTER_SUBJECT_PREFIX}.InvalidEvent`;

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
export type OrderStatus = "draft" | "open" | "paid" | "cancelled" | "refunded";
export type PaymentMethod = "cash" | "card" | "online";
export type ShiftStatus = "open" | "closed";
export type FraudSeverity = "low" | "medium" | "high" | "critical";
export type ControlScoreType = "tenant" | "location" | "shift" | "employee" | "inventory";
export type AISummaryType =
  | "daily"
  | "weekly"
  | "monthly"
  | "custom"
  | "shift"
  | "inventory"
  | "fraud"
  | "control-score";

export type MonetaryValue = {
  amount: number;
  currency: CurrencyCode;
};

export type OrderCreatedPayload = {
  orderId: string;
  tenantId: string;
  status: OrderStatus;
  total: MonetaryValue;
  currency: CurrencyCode;
  createdAt: string;
};

export type OrderPaidPayload = {
  orderId: string;
  tenantId: string;
  amount: MonetaryValue;
  paymentMethod: PaymentMethod;
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
  employeeId?: string;
  detectedAt: string;
  riskScore: number;
  severity: FraudSeverity;
  description: string;
};

export type ControlScoreUpdatedPayload = {
  scoreId: string;
  tenantId: string;
  entityId: string;
  scoreType: ControlScoreType;
  score: number;
  previousScore?: number;
  updatedAt: string;
};

export type AISummaryGeneratedPayload = {
  summaryId: string;
  tenantId: string;
  sourceId: string;
  summaryType: AISummaryType;
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
  metadata?: Record<string, string | number | boolean | null>;
  payload: EventPayloadMap[T];
};

export type EventSubject<T extends EventName = EventName> =
  `${typeof EVENT_SUBJECT_PREFIX}.${T}`;

export type DeadLetterSubject<T extends EventName = EventName> =
  `${typeof DEAD_LETTER_SUBJECT_PREFIX}.${T}`;

export type EventContract<T extends EventName = EventName> = {
  eventName: T;
  subject: EventSubject<T>;
  aggregateType: string;
  producer: string;
  primaryConsumers: string[];
  schema: JsonSchema;
};

export type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  items?: JsonSchema;
  enum?: readonly string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  format?: string;
  description?: string;
  oneOf?: JsonSchema[];
};

const nonEmptyStringSchema: JsonSchema = {
  type: "string",
  minLength: 1,
  description: "Non-empty string"
};

const dateTimeSchema: JsonSchema = {
  type: "string",
  format: "date-time"
};

const monetaryValueSchema: JsonSchema = {
  type: "object",
  properties: {
    amount: { type: "integer", minimum: 0 },
    currency: { type: "string", enum: ["USD", "UZS"] }
  },
  required: ["amount", "currency"],
  additionalProperties: false
};

export function eventSubject<T extends EventName>(eventName: T): EventSubject<T> {
  return `${EVENT_SUBJECT_PREFIX}.${eventName}` as EventSubject<T>;
}

export function deadLetterSubject<T extends EventName>(eventName: T): DeadLetterSubject<T> {
  return `${DEAD_LETTER_SUBJECT_PREFIX}.${eventName}` as DeadLetterSubject<T>;
}

export function isEventName(value: unknown): value is EventName {
  return typeof value === "string" && EVENT_NAMES.includes(value as EventName);
}

export const EVENT_SCHEMAS: { [K in EventName]: JsonSchema } = {
  OrderCreated: {
    type: "object",
    properties: {
      tenantId: nonEmptyStringSchema,
      orderId: nonEmptyStringSchema,
      status: { type: "string", enum: ["draft", "open", "paid", "cancelled", "refunded"] },
      total: monetaryValueSchema,
      currency: { type: "string", enum: ["USD", "UZS"] },
      createdAt: dateTimeSchema
    },
    required: ["tenantId", "orderId", "status", "total", "currency", "createdAt"],
    additionalProperties: false
  },
  OrderPaid: {
    type: "object",
    properties: {
      tenantId: nonEmptyStringSchema,
      orderId: nonEmptyStringSchema,
      amount: monetaryValueSchema,
      paymentMethod: { type: "string", enum: ["cash", "card", "online"] },
      paidAt: dateTimeSchema
    },
    required: ["tenantId", "orderId", "amount", "paymentMethod", "paidAt"],
    additionalProperties: false
  },
  OrderCancelled: {
    type: "object",
    properties: {
      tenantId: nonEmptyStringSchema,
      orderId: nonEmptyStringSchema,
      cancelledAt: dateTimeSchema,
      reason: { type: "string" }
    },
    required: ["tenantId", "orderId", "cancelledAt"],
    additionalProperties: false
  },
  ShiftOpened: {
    type: "object",
    properties: {
      tenantId: nonEmptyStringSchema,
      shiftId: nonEmptyStringSchema,
      cashierId: nonEmptyStringSchema,
      openingCash: monetaryValueSchema,
      openedAt: dateTimeSchema
    },
    required: ["tenantId", "shiftId", "cashierId", "openingCash", "openedAt"],
    additionalProperties: false
  },
  ShiftClosed: {
    type: "object",
    properties: {
      tenantId: nonEmptyStringSchema,
      shiftId: nonEmptyStringSchema,
      closingCash: monetaryValueSchema,
      closedAt: dateTimeSchema
    },
    required: ["tenantId", "shiftId", "closingCash", "closedAt"],
    additionalProperties: false
  },
  InventoryReceived: {
    type: "object",
    properties: {
      tenantId: nonEmptyStringSchema,
      inventoryId: nonEmptyStringSchema,
      productId: nonEmptyStringSchema,
      quantity: { type: "integer", minimum: 1 },
      receivedAt: dateTimeSchema
    },
    required: ["tenantId", "inventoryId", "productId", "quantity", "receivedAt"],
    additionalProperties: false
  },
  InventoryWrittenOff: {
    type: "object",
    properties: {
      tenantId: nonEmptyStringSchema,
      inventoryId: nonEmptyStringSchema,
      productId: nonEmptyStringSchema,
      quantity: { type: "integer", minimum: 1 },
      writtenOffAt: dateTimeSchema,
      reason: { type: "string" }
    },
    required: ["tenantId", "inventoryId", "productId", "quantity", "writtenOffAt"],
    additionalProperties: false
  },
  FraudDetected: {
    type: "object",
    properties: {
      tenantId: nonEmptyStringSchema,
      incidentId: nonEmptyStringSchema,
      orderId: { type: "string" },
      employeeId: { type: "string" },
      detectedAt: dateTimeSchema,
      riskScore: { type: "number", minimum: 0, maximum: 100 },
      severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
      description: nonEmptyStringSchema
    },
    required: ["tenantId", "incidentId", "detectedAt", "riskScore", "severity", "description"],
    additionalProperties: false
  },
  ControlScoreUpdated: {
    type: "object",
    properties: {
      tenantId: nonEmptyStringSchema,
      scoreId: nonEmptyStringSchema,
      entityId: nonEmptyStringSchema,
      scoreType: {
        type: "string",
        enum: ["tenant", "location", "shift", "employee", "inventory"]
      },
      score: { type: "number", minimum: 0, maximum: 100 },
      previousScore: { type: "number", minimum: 0, maximum: 100 },
      updatedAt: dateTimeSchema
    },
    required: ["tenantId", "scoreId", "entityId", "scoreType", "score", "updatedAt"],
    additionalProperties: false
  },
  AISummaryGenerated: {
    type: "object",
    properties: {
      tenantId: nonEmptyStringSchema,
      summaryId: nonEmptyStringSchema,
      sourceId: nonEmptyStringSchema,
      summaryType: {
        type: "string",
        enum: ["daily", "weekly", "monthly", "custom", "shift", "inventory", "fraud", "control-score"]
      },
      summary: nonEmptyStringSchema,
      generatedAt: dateTimeSchema
    },
    required: ["tenantId", "summaryId", "sourceId", "summaryType", "summary", "generatedAt"],
    additionalProperties: false
  }
};

export const EVENT_CONTRACTS: { [K in EventName]: EventContract<K> } = {
  OrderCreated: {
    eventName: "OrderCreated",
    subject: eventSubject("OrderCreated"),
    aggregateType: "order",
    producer: "pos",
    primaryConsumers: ["kitchen", "inventory", "fraud", "analytics"],
    schema: EVENT_SCHEMAS.OrderCreated
  },
  OrderPaid: {
    eventName: "OrderPaid",
    subject: eventSubject("OrderPaid"),
    aggregateType: "order",
    producer: "pos",
    primaryConsumers: ["shift", "fraud", "control-score", "analytics"],
    schema: EVENT_SCHEMAS.OrderPaid
  },
  OrderCancelled: {
    eventName: "OrderCancelled",
    subject: eventSubject("OrderCancelled"),
    aggregateType: "order",
    producer: "pos",
    primaryConsumers: ["inventory", "fraud", "analytics"],
    schema: EVENT_SCHEMAS.OrderCancelled
  },
  ShiftOpened: {
    eventName: "ShiftOpened",
    subject: eventSubject("ShiftOpened"),
    aggregateType: "shift",
    producer: "employee-management",
    primaryConsumers: ["pos", "control-score", "analytics"],
    schema: EVENT_SCHEMAS.ShiftOpened
  },
  ShiftClosed: {
    eventName: "ShiftClosed",
    subject: eventSubject("ShiftClosed"),
    aggregateType: "shift",
    producer: "employee-management",
    primaryConsumers: ["control-score", "ai-summary", "analytics"],
    schema: EVENT_SCHEMAS.ShiftClosed
  },
  InventoryReceived: {
    eventName: "InventoryReceived",
    subject: eventSubject("InventoryReceived"),
    aggregateType: "inventory",
    producer: "inventory",
    primaryConsumers: ["control-score", "analytics"],
    schema: EVENT_SCHEMAS.InventoryReceived
  },
  InventoryWrittenOff: {
    eventName: "InventoryWrittenOff",
    subject: eventSubject("InventoryWrittenOff"),
    aggregateType: "inventory",
    producer: "inventory",
    primaryConsumers: ["fraud", "control-score", "analytics"],
    schema: EVENT_SCHEMAS.InventoryWrittenOff
  },
  FraudDetected: {
    eventName: "FraudDetected",
    subject: eventSubject("FraudDetected"),
    aggregateType: "fraud-incident",
    producer: "fraud",
    primaryConsumers: ["control-score", "ai-summary", "notifications"],
    schema: EVENT_SCHEMAS.FraudDetected
  },
  ControlScoreUpdated: {
    eventName: "ControlScoreUpdated",
    subject: eventSubject("ControlScoreUpdated"),
    aggregateType: "control-score",
    producer: "control-score",
    primaryConsumers: ["dashboard", "ai-summary", "analytics"],
    schema: EVENT_SCHEMAS.ControlScoreUpdated
  },
  AISummaryGenerated: {
    eventName: "AISummaryGenerated",
    subject: eventSubject("AISummaryGenerated"),
    aggregateType: "ai-summary",
    producer: "ai-summary",
    primaryConsumers: ["dashboard", "notifications"],
    schema: EVENT_SCHEMAS.AISummaryGenerated
  }
};
