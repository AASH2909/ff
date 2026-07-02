import { DomainError } from "@/domain/errors";

export const NOTIFICATION_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export function normalizeNotificationPriority(
  value: string | null | undefined
): NotificationPriority {
  const normalized = value?.trim().toUpperCase();

  if (isNotificationPriority(normalized)) {
    return normalized;
  }

  throw new DomainError("Notification priority is invalid.");
}

export function isNotificationPriority(value: unknown): value is NotificationPriority {
  return (
    typeof value === "string" &&
    NOTIFICATION_PRIORITIES.includes(value as NotificationPriority)
  );
}
