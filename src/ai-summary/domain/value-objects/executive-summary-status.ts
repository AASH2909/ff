import { DomainError } from "@/domain/errors";

export const EXECUTIVE_SUMMARY_STATUSES = ["DRAFT", "READY", "FAILED"] as const;

export type ExecutiveSummaryStatus = (typeof EXECUTIVE_SUMMARY_STATUSES)[number];

export function normalizeExecutiveSummaryStatus(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase();

  if (isExecutiveSummaryStatus(normalized)) {
    return normalized;
  }

  throw new DomainError("Executive summary status is invalid.");
}

export function isExecutiveSummaryStatus(value: unknown): value is ExecutiveSummaryStatus {
  return (
    typeof value === "string" &&
    EXECUTIVE_SUMMARY_STATUSES.includes(value as ExecutiveSummaryStatus)
  );
}
