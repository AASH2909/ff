import type { ApplicationError } from "@/application/result";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { IdGenerator } from "@/application/ports/id-generator";
import type { CopilotEngine } from "@/copilot/domain";
import type { CopilotRepository } from "@/copilot/application/repositories";

export type CopilotUseCaseCommonDependencies = {
  copilotRepository: CopilotRepository;
};

export type AskCopilotUseCaseDependencies = CopilotUseCaseCommonDependencies & {
  copilotEngine: CopilotEngine;
  idGenerator: IdGenerator;
  clock?: Clock;
};

export function getCopilotClock(dependencies: { clock?: Clock }) {
  return dependencies.clock ?? systemClock;
}

export function mapUnexpectedCopilotError(error: unknown): ApplicationError {
  void error;

  return {
    code: "PERSISTENCE_ERROR",
    message: "Unable to complete copilot request."
  };
}
