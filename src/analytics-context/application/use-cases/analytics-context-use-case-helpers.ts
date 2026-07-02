import type { ApplicationError } from "@/application/result";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";

export type AnalyticsContextUseCaseCommonDependencies = {
  clock?: Clock;
};

export function getAnalyticsContextClock(
  dependencies: AnalyticsContextUseCaseCommonDependencies
) {
  return dependencies.clock ?? systemClock;
}

export function mapUnexpectedAnalyticsContextError(error: unknown): ApplicationError {
  void error;

  return {
    code: "PERSISTENCE_ERROR",
    message: "Unable to load analytics context data."
  };
}
