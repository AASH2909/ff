import type {
  Incident,
  IncidentMetadata,
  IncidentSeverity,
  Notification,
  NotificationChannel,
  NotificationLifecycleStatus,
  NotificationMetadata,
  NotificationPriority,
  NotificationRecipientType
} from "@/notification/domain";

export type NotificationScopeDto = {
  tenantId: string;
  businessUnitId?: string;
};

export type IncidentQueryDto = NotificationScopeDto & {
  status?: string;
  severity?: string;
  category?: string;
  limit?: number;
};

export type IncidentByIdQueryDto = NotificationScopeDto & {
  id: string;
};

export type IncidentLifecycleCommandDto = NotificationScopeDto & {
  id: string;
};

export type NotificationQueryDto = NotificationScopeDto & {
  status?: string;
  channel?: string;
  incidentId?: string;
  limit?: number;
};

export type IncidentDto = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  severity: IncidentSeverity;
  status: NotificationLifecycleStatus;
  title: string;
  description: string;
  sourceEvent: string;
  sourceEventId: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  metadata: IncidentMetadata;
};

export type NotificationDto = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  incidentId: string;
  recipientType: NotificationRecipientType;
  channel: NotificationChannel;
  status: NotificationLifecycleStatus;
  priority: NotificationPriority;
  createdAt: string;
  sentAt: string | null;
  acknowledgedAt: string | null;
  metadata: NotificationMetadata;
};

export type IncidentsOutputDto = {
  incidents: IncidentDto[];
};

export type IncidentOutputDto = {
  incident: IncidentDto;
};

export type NotificationsOutputDto = {
  notifications: NotificationDto[];
};

export type ProcessNotificationEventOutputDto = {
  incident: IncidentDto;
  notifications: NotificationDto[];
  duplicate: boolean;
};

export function toIncidentDto(incident: Incident): IncidentDto {
  return {
    id: incident.id,
    tenantId: incident.tenantId,
    businessUnitId: incident.businessUnitId,
    severity: incident.severity,
    status: incident.status,
    title: incident.title,
    description: incident.description,
    sourceEvent: incident.sourceEvent,
    sourceEventId: incident.sourceEventId,
    category: incident.category,
    createdAt: incident.createdAt.toISOString(),
    updatedAt: incident.updatedAt.toISOString(),
    resolvedAt: incident.resolvedAt?.toISOString() ?? null,
    metadata: incident.metadata
  };
}

export function toNotificationDto(notification: Notification): NotificationDto {
  return {
    id: notification.id,
    tenantId: notification.tenantId,
    businessUnitId: notification.businessUnitId,
    incidentId: notification.incidentId,
    recipientType: notification.recipientType,
    channel: notification.channel,
    status: notification.status,
    priority: notification.priority,
    createdAt: notification.createdAt.toISOString(),
    sentAt: notification.sentAt?.toISOString() ?? null,
    acknowledgedAt: notification.acknowledgedAt?.toISOString() ?? null,
    metadata: notification.metadata
  };
}
