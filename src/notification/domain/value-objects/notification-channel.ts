import { DomainError } from "@/domain/errors";

export const NOTIFICATION_CHANNELS = ["IN_APP", "DASHBOARD", "API"] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export function normalizeNotificationChannel(value: string | null | undefined): NotificationChannel {
  const normalized = value?.trim().toUpperCase();

  if (isNotificationChannel(normalized)) {
    return normalized;
  }

  throw new DomainError("Notification channel is invalid.");
}

export function isNotificationChannel(value: unknown): value is NotificationChannel {
  return typeof value === "string" && NOTIFICATION_CHANNELS.includes(value as NotificationChannel);
}
