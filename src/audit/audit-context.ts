import type { AuditAction, AuditMetadata, AuditResourceType } from "./types";

export type AuditContext = {
  tenantId: string;
  userId: string;
  correlationId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  metadata?: AuditMetadata;
};

export type AuditPayload = {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  metadata?: AuditMetadata;
};
