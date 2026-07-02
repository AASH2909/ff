import { DomainError } from "@/domain/errors";

export const PREDICTION_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export type PredictionRiskLevel = (typeof PREDICTION_RISK_LEVELS)[number];

export function isPredictionRiskLevel(value: unknown): value is PredictionRiskLevel {
  return (
    typeof value === "string" &&
    PREDICTION_RISK_LEVELS.includes(value as PredictionRiskLevel)
  );
}

export function normalizePredictionRiskLevel(
  value: string | null | undefined
): PredictionRiskLevel {
  const normalized = value?.trim().toUpperCase();

  if (isPredictionRiskLevel(normalized)) {
    return normalized;
  }

  throw new DomainError("Prediction risk level is invalid.");
}
