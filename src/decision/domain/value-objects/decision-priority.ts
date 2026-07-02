import { DomainError } from "@/domain/errors";

export const DECISION_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export type DecisionPriority = (typeof DECISION_PRIORITIES)[number];

export function isDecisionPriority(value: unknown): value is DecisionPriority {
  return (
    typeof value === "string" &&
    DECISION_PRIORITIES.includes(value as DecisionPriority)
  );
}

export function normalizeDecisionPriority(
  value: string | null | undefined
): DecisionPriority {
  const normalized = value?.trim().toUpperCase();

  if (isDecisionPriority(normalized)) {
    return normalized;
  }

  throw new DomainError("Decision priority is invalid.");
}
