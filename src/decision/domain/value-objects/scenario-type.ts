import { DomainError } from "@/domain/errors";

export const SCENARIO_TYPES = [
  "RESOLVE_CRITICAL_INCIDENTS",
  "EXECUTE_HIGH_PRIORITY_RECOMMENDATIONS",
  "REDUCE_FRAUD_RISK",
  "IMPROVE_INVENTORY_CONTROL",
  "IMPROVE_OPERATIONS",
  "STABILIZE_CONTROL_SCORE",
  "MAINTAIN_STABLE_OPERATIONS"
] as const;

export type ScenarioType = (typeof SCENARIO_TYPES)[number];

export function isScenarioType(value: unknown): value is ScenarioType {
  return typeof value === "string" && SCENARIO_TYPES.includes(value as ScenarioType);
}

export function normalizeScenarioType(value: string | null | undefined): ScenarioType {
  const normalized = value?.trim().toUpperCase();

  if (isScenarioType(normalized)) {
    return normalized;
  }

  throw new DomainError("Decision scenario type is invalid.");
}
