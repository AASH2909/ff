import type {
  AuditAction,
  AuditActorType,
  AuditDevice,
  AuditMetadata,
  AuditNetwork,
  AuditOutcome,
  AuditResourceType,
  AuditSensitivity
} from "./types";

export type AuditContext = {
  tenantId: string;
  userId: string;
  actorType?: AuditActorType;
  actorDisplayName?: string;
  correlationId?: string;
  causationId?: string;
  requestId?: string;
  sessionId?: string;
  source?: string;
  ipAddress?: string;
  forwardedFor?: string;
  userAgent?: string;
  deviceInfo?: string;
  device?: AuditDevice;
  network?: AuditNetwork;
  metadata?: AuditMetadata;
};

export type AuditPayload = {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  outcome?: AuditOutcome;
  occurredAt?: string;
  previousValue?: unknown;
  newValue?: unknown;
  reason?: string;
  sensitivity?: AuditSensitivity;
  metadata?: AuditMetadata;
};
