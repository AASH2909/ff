import { DomainError } from "@/domain/errors";

export const PREDICTION_TRENDS = ["IMPROVING", "STABLE", "DECLINING", "UNKNOWN"] as const;

export type PredictionTrend = (typeof PREDICTION_TRENDS)[number];

export function isPredictionTrend(value: unknown): value is PredictionTrend {
  return typeof value === "string" && PREDICTION_TRENDS.includes(value as PredictionTrend);
}

export function normalizePredictionTrend(value: string | null | undefined): PredictionTrend {
  const normalized = value?.trim().toUpperCase();

  if (isPredictionTrend(normalized)) {
    return normalized;
  }

  throw new DomainError("Prediction trend is invalid.");
}
