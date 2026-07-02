import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  DecisionScenarioOutputDto,
  DecisionScenarioQueryDto
} from "@/decision/application/dtos";
import { toDecisionScenarioDto } from "@/decision/application/dtos";
import { validateDecisionScenarioQuery } from "@/decision/application/validation";
import {
  mapUnexpectedDecisionError,
  type DecisionUseCaseCommonDependencies
} from "@/decision/application/use-cases/decision-use-case-helpers";

export class GetLatestDecisionScenarioUseCase
  implements UseCase<DecisionScenarioQueryDto, DecisionScenarioOutputDto>
{
  constructor(private readonly dependencies: DecisionUseCaseCommonDependencies) {}

  async execute(input: DecisionScenarioQueryDto): Promise<Result<DecisionScenarioOutputDto>> {
    const validation = validateDecisionScenarioQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid latest decision scenario query."
      );
    }

    try {
      const scenario = await this.dependencies.decisionScenarioRepository.findLatest(
        validation.value
      );

      if (!scenario) {
        return fail("NOT_FOUND", "Decision scenario was not found.");
      }

      return ok({
        scenario: toDecisionScenarioDto(scenario)
      });
    } catch (error) {
      const mappedError = mapUnexpectedDecisionError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
