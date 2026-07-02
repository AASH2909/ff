import { DomainError } from "@/domain/errors";

export const TIMELINE_SOURCES = ["ANALYTICS_CONTEXT", "PREDICTIVE", "EVENT_BUS"] as const;

export type TimelineSource = (typeof TIMELINE_SOURCES)[number];

export function isTimelineSource(value: unknown): value is TimelineSource {
  return typeof value === "string" && TIMELINE_SOURCES.includes(value as TimelineSource);
}

export function normalizeTimelineSource(value: string | null | undefined): TimelineSource {
  const normalized = value?.trim().toUpperCase();

  if (isTimelineSource(normalized)) {
    return normalized;
  }

  throw new DomainError("Timeline source is invalid.");
}
