import { DomainError } from "@/domain/errors";

export const TIMELINE_RELATION_TYPES = [
  "CAUSES",
  "RESULTS_IN",
  "RELATES_TO",
  "SUPPORTS",
  "PREDICTS"
] as const;

export type TimelineRelationType = (typeof TIMELINE_RELATION_TYPES)[number];

export function isTimelineRelationType(value: unknown): value is TimelineRelationType {
  return (
    typeof value === "string" &&
    TIMELINE_RELATION_TYPES.includes(value as TimelineRelationType)
  );
}

export function normalizeTimelineRelationType(
  value: string | null | undefined
): TimelineRelationType {
  const normalized = value?.trim().toUpperCase();

  if (isTimelineRelationType(normalized)) {
    return normalized;
  }

  throw new DomainError("Timeline relation type is invalid.");
}
