import { DomainError } from "@/domain/errors";

export const FACTOR_IMPACTS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export type FactorImpact = (typeof FACTOR_IMPACTS)[number];

export function isFactorImpact(value: unknown): value is FactorImpact {
  return typeof value === "string" && FACTOR_IMPACTS.includes(value as FactorImpact);
}

export function normalizeFactorImpact(value: string | null | undefined): FactorImpact {
  const normalized = value?.trim().toUpperCase();

  if (isFactorImpact(normalized)) {
    return normalized;
  }

  throw new DomainError("Prediction factor impact is invalid.");
}
