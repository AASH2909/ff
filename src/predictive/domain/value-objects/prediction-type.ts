import { DomainError } from "@/domain/errors";

export const PREDICTION_TYPES = [
  "CONTROL_SCORE",
  "FRAUD",
  "OPERATIONS",
  "INVENTORY",
  "FINANCIAL"
] as const;

export type PredictionType = (typeof PREDICTION_TYPES)[number];

export function isPredictionType(value: unknown): value is PredictionType {
  return typeof value === "string" && PREDICTION_TYPES.includes(value as PredictionType);
}

export function normalizePredictionType(value: string | null | undefined): PredictionType {
  const normalized = value?.trim().toUpperCase();

  if (isPredictionType(normalized)) {
    return normalized;
  }

  throw new DomainError("Prediction type is invalid.");
}
