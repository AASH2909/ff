import type { ApplicationError } from "@/application/result";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type {
  PredictionContextRepository,
  PredictionRepository
} from "@/predictive/application/repositories";
import { PredictionRuleEngine } from "@/predictive/domain";

export type PredictionUseCaseCommonDependencies = {
  predictionRepository: PredictionRepository;
};

export type GeneratePredictionsUseCaseDependencies = PredictionUseCaseCommonDependencies & {
  predictionContextRepository: PredictionContextRepository;
  predictionRuleEngine?: PredictionRuleEngine;
  clock?: Clock;
};

export function getPredictionRuleEngine(dependencies: GeneratePredictionsUseCaseDependencies) {
  return dependencies.predictionRuleEngine ?? new PredictionRuleEngine();
}

export function getPredictionClock(dependencies: GeneratePredictionsUseCaseDependencies) {
  return dependencies.clock ?? systemClock;
}

export function mapUnexpectedPredictionError(error: unknown): ApplicationError {
  void error;

  return {
    code: "PERSISTENCE_ERROR",
    message: "Unable to load predictive analytics data."
  };
}
