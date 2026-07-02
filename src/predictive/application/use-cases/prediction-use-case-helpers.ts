import type { ApplicationError } from "@/application/result";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { PredictionContextRepository } from "@/predictive/application/repositories";
import { PredictionRuleEngine } from "@/predictive/domain";

export type PredictionUseCaseCommonDependencies = {
  predictionContextRepository: PredictionContextRepository;
  predictionRuleEngine?: PredictionRuleEngine;
  clock?: Clock;
};

export function getPredictionRuleEngine(dependencies: PredictionUseCaseCommonDependencies) {
  return dependencies.predictionRuleEngine ?? new PredictionRuleEngine();
}

export function getPredictionClock(dependencies: PredictionUseCaseCommonDependencies) {
  return dependencies.clock ?? systemClock;
}

export function mapUnexpectedPredictionError(error: unknown): ApplicationError {
  void error;

  return {
    code: "PERSISTENCE_ERROR",
    message: "Unable to load predictive analytics data."
  };
}
