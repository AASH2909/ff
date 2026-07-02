import { DomainError } from "@/domain/errors";

export const FACTOR_DIRECTIONS = ["POSITIVE", "NEGATIVE", "NEUTRAL"] as const;

export type FactorDirection = (typeof FACTOR_DIRECTIONS)[number];

export function isFactorDirection(value: unknown): value is FactorDirection {
  return typeof value === "string" && FACTOR_DIRECTIONS.includes(value as FactorDirection);
}

export function normalizeFactorDirection(
  value: string | null | undefined
): FactorDirection {
  const normalized = value?.trim().toUpperCase();

  if (isFactorDirection(normalized)) {
    return normalized;
  }

  throw new DomainError("Prediction factor direction is invalid.");
}
