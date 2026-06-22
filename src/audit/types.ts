export type AuditAction =
  | "order.created"
  | "order.updated"
  | "order.cancelled"
  | "order.paid"
  | "order.refunded"
  | "payment.created"
  | "payment.refunded"
  | "inventory.received"
  | "inventory.written_off"
  | "employee.created"
  | "employee.updated"
  | "employee.deleted"
  | "permission.granted"
  | "permission.revoked"
  | "pricing.updated"
  | "discount.applied"
  | "discount.removed"
  | "shift.opened"
  | "shift.closed"
  | "control_score.updated"
  | "ai_summary.generated";

export type AuditResourceType =
  | "order"
  | "payment"
  | "inventory"
  | "employee"
  | "permission"
  | "pricing"
  | "discount"
  | "refund"
  | "shift"
  | "control_score"
  | "ai_summary";

export type AuditMetadata = {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  browser?: string;
  operatingSystem?: string;
  correlationId?: string;
  sessionId?: string;
  clientId?: string;
  location?: string;
  [key: string]: unknown;
};

export type AuditRecord = {
  id: string;
  tenantId: string;
  userId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string | null;
  occurredAt: string;
  previousValue?: unknown;
  newValue?: unknown;
  metadata?: AuditMetadata;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  correlationId?: string | null;
  createdAt: string;
};

export type AuditQueryFilters = {
  tenantId: string;
  userId?: string;
  action?: AuditAction;
  resourceType?: AuditResourceType;
  resourceId?: string;
  correlationId?: string;
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
