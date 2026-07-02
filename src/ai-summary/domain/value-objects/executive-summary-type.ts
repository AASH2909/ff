import { DomainError } from "@/domain/errors";

export const EXECUTIVE_SUMMARY_TYPES = ["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"] as const;

export type ExecutiveSummaryType = (typeof EXECUTIVE_SUMMARY_TYPES)[number];

export function normalizeExecutiveSummaryType(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase();

  if (isExecutiveSummaryType(normalized)) {
    return normalized;
  }

  throw new DomainError("Executive summary type is invalid.");
}

export function isExecutiveSummaryType(value: unknown): value is ExecutiveSummaryType {
  return (
    typeof value === "string" &&
    EXECUTIVE_SUMMARY_TYPES.includes(value as ExecutiveSummaryType)
  );
}
