import { DomainError } from "@/domain/errors";

export const TIMELINE_TYPES = [
  "FACT",
  "CAUSE",
  "EFFECT",
  "PREDICTION",
  "RECOMMENDATION"
] as const;

export type TimelineType = (typeof TIMELINE_TYPES)[number];

export function isTimelineType(value: unknown): value is TimelineType {
  return typeof value === "string" && TIMELINE_TYPES.includes(value as TimelineType);
}

export function normalizeTimelineType(value: string | null | undefined): TimelineType {
  const normalized = value?.trim().toUpperCase();

  if (isTimelineType(normalized)) {
    return normalized;
  }

  throw new DomainError("Timeline type is invalid.");
}
