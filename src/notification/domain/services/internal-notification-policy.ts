import type { IdGenerator } from "@/application/ports/id-generator";
import {
  Incident,
  Notification,
  type NotificationRecipientType
} from "@/notification/domain/entities";
import type {
  NotificationChannel,
  NotificationPriority
} from "@/notification/domain/value-objects";

export class InternalNotificationPolicy {
  createNotifications(input: {
    incident: Incident;
    idGenerator: IdGenerator;
    createdAt: Date;
  }) {
    const priority = priorityFromSeverity(input.incident.severity);
    const recipients = recipientsForSeverity(input.incident.severity);

    return recipients.flatMap((recipientType) =>
      internalChannelsForRecipient(recipientType).map(
        (channel) =>
          new Notification({
            id: input.idGenerator.nextId(),
            tenantId: input.incident.tenantId,
            businessUnitId: input.incident.businessUnitId,
            incidentId: input.incident.id,
            recipientType,
            channel,
            status: "SENT",
            priority,
            createdAt: input.createdAt,
            sentAt: input.createdAt,
            acknowledgedAt: null,
            metadata: {
              incidentSeverity: input.incident.severity,
              incidentCategory: input.incident.category,
              sourceEvent: input.incident.sourceEvent
            }
          })
      )
    );
  }
}

function priorityFromSeverity(severity: Incident["severity"]): NotificationPriority {
  if (severity === "severe") {
    return "CRITICAL";
  }

  if (severity === "critical") {
    return "HIGH";
  }

  if (severity === "warning") {
    return "MEDIUM";
  }

  return "LOW";
}

function recipientsForSeverity(severity: Incident["severity"]): NotificationRecipientType[] {
  if (severity === "severe" || severity === "critical") {
    return ["EXECUTIVE", "CONTROL_CENTER"];
  }

  return ["OPERATIONS", "CONTROL_CENTER"];
}

function internalChannelsForRecipient(
  recipientType: NotificationRecipientType
): NotificationChannel[] {
  if (recipientType === "CONTROL_CENTER") {
    return ["DASHBOARD", "API"];
  }

  return ["IN_APP", "DASHBOARD"];
}
