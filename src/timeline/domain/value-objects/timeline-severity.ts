import { DomainError } from "@/domain/errors";

export const TIMELINE_SEVERITIES = ["INFO", "WARNING", "CRITICAL", "SEVERE"] as const;

export type TimelineSeverity = (typeof TIMELINE_SEVERITIES)[number];

export function isTimelineSeverity(value: unknown): value is TimelineSeverity {
  return typeof value === "string" && TIMELINE_SEVERITIES.includes(value as TimelineSeverity);
}

export function normalizeTimelineSeverity(
  value: string | null | undefined
): TimelineSeverity {
  const normalized = value?.trim().toUpperCase();

  if (isTimelineSeverity(normalized)) {
    return normalized;
  }

  if (normalized === "INFORMATION") {
    return "INFO";
  }

  throw new DomainError("Timeline severity is invalid.");
}
