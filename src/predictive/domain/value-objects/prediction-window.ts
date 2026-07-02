import { DomainError } from "@/domain/errors";

export const PREDICTION_WINDOWS = ["NEXT_7_DAYS", "NEXT_30_DAYS", "NEXT_90_DAYS"] as const;

export type PredictionWindow = (typeof PREDICTION_WINDOWS)[number];

export const DEFAULT_PREDICTION_WINDOW: PredictionWindow = "NEXT_30_DAYS";

export function isPredictionWindow(value: unknown): value is PredictionWindow {
  return typeof value === "string" && PREDICTION_WINDOWS.includes(value as PredictionWindow);
}

export function normalizePredictionWindow(value: string | null | undefined): PredictionWindow {
  const normalized = value?.trim().toUpperCase();

  if (isPredictionWindow(normalized)) {
    return normalized;
  }

  throw new DomainError("Prediction window is invalid.");
}
