import {
  Incident,
  Notification,
  normalizeIncidentSeverity,
  normalizeNotificationChannel,
  normalizeNotificationLifecycleStatus,
  normalizeNotificationPriority,
  type IncidentMetadata,
  type NotificationMetadata,
  type NotificationRecipientType
} from "@/notification/domain";
import type { Database, Json } from "@/types/database";

export type IncidentRow = Database["public"]["Tables"]["incidents"]["Row"];
export type IncidentInsert = Database["public"]["Tables"]["incidents"]["Insert"];
export type IncidentUpdate = Database["public"]["Tables"]["incidents"]["Update"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];

export function mapIncidentRow(row: IncidentRow) {
  return new Incident({
    id: row.id,
    tenantId: row.tenant_id,
    businessUnitId: row.business_unit_id,
    severity: normalizeIncidentSeverity(row.severity),
    status: normalizeNotificationLifecycleStatus(row.status),
    title: row.title,
    description: row.description,
    sourceEvent: row.source_event,
    sourceEventId: row.source_event_id,
    category: row.category,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at) : null,
    metadata: jsonToIncidentMetadata(row.metadata)
  });
}

export function mapIncidentInsert(incident: Incident): IncidentInsert {
  return {
    id: incident.id,
    tenant_id: incident.tenantId,
    business_unit_id: incident.businessUnitId,
    severity: incident.severity,
    status: incident.status,
    title: incident.title,
    description: incident.description,
    source_event: incident.sourceEvent,
    source_event_id: incident.sourceEventId,
    category: incident.category,
    created_at: incident.createdAt.toISOString(),
    updated_at: incident.updatedAt.toISOString(),
    resolved_at: incident.resolvedAt?.toISOString() ?? null,
    metadata: incident.metadata
  };
}

export function mapIncidentUpdate(incident: Incident): IncidentUpdate {
  return {
    severity: incident.severity,
    status: incident.status,
    title: incident.title,
    description: incident.description,
    category: incident.category,
    updated_at: incident.updatedAt.toISOString(),
    resolved_at: incident.resolvedAt?.toISOString() ?? null,
    metadata: incident.metadata
  };
}

export function mapNotificationRow(row: NotificationRow) {
  return new Notification({
    id: row.id,
    tenantId: row.tenant_id,
    businessUnitId: row.business_unit_id,
    incidentId: row.incident_id,
    recipientType: normalizeRecipientType(row.recipient_type),
    channel: normalizeNotificationChannel(row.channel),
    status: normalizeNotificationLifecycleStatus(row.status),
    priority: normalizeNotificationPriority(row.priority),
    createdAt: new Date(row.created_at),
    sentAt: row.sent_at ? new Date(row.sent_at) : null,
    acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : null,
    metadata: jsonToNotificationMetadata(row.metadata)
  });
}

export function mapNotificationInsert(notification: Notification): NotificationInsert {
  return {
    id: notification.id,
    tenant_id: notification.tenantId,
    business_unit_id: notification.businessUnitId,
    incident_id: notification.incidentId,
    recipient_type: notification.recipientType,
    channel: notification.channel,
    status: notification.status,
    priority: notification.priority,
    created_at: notification.createdAt.toISOString(),
    sent_at: notification.sentAt?.toISOString() ?? null,
    acknowledged_at: notification.acknowledgedAt?.toISOString() ?? null,
    metadata: notification.metadata
  };
}

function jsonToIncidentMetadata(value: Json): IncidentMetadata {
  return jsonToMetadata(value);
}

function jsonToNotificationMetadata(value: Json): NotificationMetadata {
  return jsonToMetadata(value);
}

function jsonToMetadata<TMetadata extends IncidentMetadata | NotificationMetadata>(
  value: Json
): TMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as TMetadata;
  }

  return Object.entries(value).reduce<TMetadata>((metadata, [key, item]) => {
    if (item !== undefined && isMetadataValue(item)) {
      metadata[key as keyof TMetadata] = item as TMetadata[keyof TMetadata];
    }

    return metadata;
  }, {} as TMetadata);
}

function isMetadataValue(
  value: Json
): value is IncidentMetadata[string] | NotificationMetadata[string] {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" || typeof item === "number")
  );
}

function normalizeRecipientType(value: string): NotificationRecipientType {
  if (value === "EXECUTIVE" || value === "OPERATIONS" || value === "CONTROL_CENTER") {
    return value;
  }

  return "CONTROL_CENTER";
}
