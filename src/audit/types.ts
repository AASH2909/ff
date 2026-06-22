export const AUDIT_ACTIONS = [
  "order.created",
  "order.updated",
  "order.item_added",
  "order.item_removed",
  "order.cancelled",
  "order.paid",
  "order.refunded",
  "payment.created",
  "payment.captured",
  "payment.failed",
  "payment.refunded",
  "inventory.received",
  "inventory.adjusted",
  "inventory.written_off",
  "inventory.counted",
  "employee.created",
  "employee.updated",
  "employee.deactivated",
  "employee.role_assigned",
  "employee.role_removed",
  "permission.granted",
  "permission.revoked",
  "permission.role_created",
  "permission.role_updated",
  "pricing.created",
  "pricing.updated",
  "pricing.deleted",
  "discount.created",
  "discount.updated",
  "discount.applied",
  "discount.removed",
  "discount.disabled",
  "refund.created",
  "refund.approved",
  "refund.rejected",
  "refund.completed",
  "shift.opened",
  "shift.closed",
  "control_score.updated",
  "ai_summary.generated",
  "audit.viewed",
  "audit.exported"
] as const;

export const AUDIT_RESOURCE_TYPES = [
  "order",
  "payment",
  "inventory",
  "employee",
  "permission",
  "pricing",
  "discount",
  "refund",
  "shift",
  "control_score",
  "ai_summary",
  "audit_log"
] as const;

export const AUDIT_ACTOR_TYPES = ["user", "system", "service", "api_key"] as const;
export const AUDIT_OUTCOMES = ["success", "failure", "denied"] as const;
export const AUDIT_SENSITIVITIES = ["internal", "confidential", "restricted"] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export type AuditResourceType = (typeof AUDIT_RESOURCE_TYPES)[number];
export type AuditActorType = (typeof AUDIT_ACTOR_TYPES)[number];
export type AuditOutcome = (typeof AUDIT_OUTCOMES)[number];
export type AuditSensitivity = (typeof AUDIT_SENSITIVITIES)[number];

export type AuditDevice = {
  userAgent?: string;
  deviceInfo?: string;
  browser?: string;
  operatingSystem?: string;
  deviceType?: string;
  deviceId?: string;
};

export type AuditNetwork = {
  ipAddress?: string;
  forwardedFor?: string;
  country?: string;
  region?: string;
  city?: string;
};

export type AuditMetadata = {
  correlationId?: string;
  causationId?: string;
  requestId?: string;
  sessionId?: string;
  eventId?: string;
  source?: string;
  locationId?: string;
  terminalId?: string;
  complianceTags?: string[];
  [key: string]: unknown;
};

export type AuditRecord = {
  id: string;
  tenantId: string;
  userId: string;
  actorType: AuditActorType;
  actorDisplayName?: string | null;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string | null;
  outcome: AuditOutcome;
  occurredAt: string;
  previousValue?: unknown;
  newValue?: unknown;
  reason?: string | null;
  metadata?: AuditMetadata;
  ipAddress?: string | null;
  forwardedFor?: string | null;
  userAgent?: string | null;
  deviceInfo?: string | null;
  correlationId?: string | null;
  causationId?: string | null;
  requestId?: string | null;
  sessionId?: string | null;
  source?: string | null;
  sensitivity: AuditSensitivity;
  hash?: string | null;
  hashAlgorithm?: string | null;
  createdAt: string;
};

export type AuditQueryFilters = {
  tenantId: string;
  userId?: string;
  actorType?: AuditActorType;
  action?: AuditAction;
  actions?: AuditAction[];
  resourceType?: AuditResourceType;
  resourceTypes?: AuditResourceType[];
  resourceId?: string;
  outcome?: AuditOutcome;
  correlationId?: string;
  requestId?: string;
  sessionId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type AuditQueryResult = {
  items: AuditRecord[];
  totalCount: number;
};

export function isAuditAction(value: unknown): value is AuditAction {
  return typeof value === "string" && AUDIT_ACTIONS.includes(value as AuditAction);
}

export function isAuditResourceType(value: unknown): value is AuditResourceType {
  return (
    typeof value === "string" &&
    AUDIT_RESOURCE_TYPES.includes(value as AuditResourceType)
  );
}

export function isAuditActorType(value: unknown): value is AuditActorType {
  return typeof value === "string" && AUDIT_ACTOR_TYPES.includes(value as AuditActorType);
}

export function isAuditOutcome(value: unknown): value is AuditOutcome {
  return typeof value === "string" && AUDIT_OUTCOMES.includes(value as AuditOutcome);
}

export function isAuditSensitivity(value: unknown): value is AuditSensitivity {
  return typeof value === "string" && AUDIT_SENSITIVITIES.includes(value as AuditSensitivity);
}
