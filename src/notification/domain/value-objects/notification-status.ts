import { DomainError } from "@/domain/errors";

export const NOTIFICATION_LIFECYCLE_STATUSES = [
  "NEW",
  "PENDING",
  "SENT",
  "ACKNOWLEDGED",
  "RESOLVED",
  "FAILED"
] as const;

export type NotificationLifecycleStatus = (typeof NOTIFICATION_LIFECYCLE_STATUSES)[number];

export function normalizeNotificationLifecycleStatus(
  value: string | null | undefined
): NotificationLifecycleStatus {
  const normalized = value?.trim().toUpperCase();

  if (isNotificationLifecycleStatus(normalized)) {
    return normalized;
  }

  throw new DomainError("Notification lifecycle status is invalid.");
}

export function isNotificationLifecycleStatus(
  value: unknown
): value is NotificationLifecycleStatus {
  return (
    typeof value === "string" &&
    NOTIFICATION_LIFECYCLE_STATUSES.includes(value as NotificationLifecycleStatus)
  );
}
