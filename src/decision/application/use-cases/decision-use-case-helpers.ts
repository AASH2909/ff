import type { ApplicationError } from "@/application/result";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type {
  DecisionScenarioRepository,
  DecisionSourceRepository
} from "@/decision/application/repositories";
import { DecisionScenarioRuleEngine } from "@/decision/domain";

export type DecisionUseCaseCommonDependencies = {
  decisionScenarioRepository: DecisionScenarioRepository;
};

export type GenerateDecisionScenariosUseCaseDependencies =
  DecisionUseCaseCommonDependencies & {
    decisionSourceRepository: DecisionSourceRepository;
    decisionScenarioRuleEngine?: DecisionScenarioRuleEngine;
    clock?: Clock;
  };

export function getDecisionScenarioRuleEngine(
  dependencies: GenerateDecisionScenariosUseCaseDependencies
) {
  return dependencies.decisionScenarioRuleEngine ?? new DecisionScenarioRuleEngine();
}

export function getDecisionClock(dependencies: GenerateDecisionScenariosUseCaseDependencies) {
  return dependencies.clock ?? systemClock;
}

export function mapUnexpectedDecisionError(error: unknown): ApplicationError {
  void error;

  return {
    code: "PERSISTENCE_ERROR",
    message: "Unable to load decision intelligence data."
  };
}
