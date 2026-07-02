import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  DecisionScenarioByIdQueryDto,
  DecisionScenarioOutputDto
} from "@/decision/application/dtos";
import { toDecisionScenarioDto } from "@/decision/application/dtos";
import { validateDecisionScenarioByIdQuery } from "@/decision/application/validation";
import {
  mapUnexpectedDecisionError,
  type DecisionUseCaseCommonDependencies
} from "@/decision/application/use-cases/decision-use-case-helpers";

export class GetDecisionScenarioByIdUseCase
  implements UseCase<DecisionScenarioByIdQueryDto, DecisionScenarioOutputDto>
{
  constructor(private readonly dependencies: DecisionUseCaseCommonDependencies) {}

  async execute(
    input: DecisionScenarioByIdQueryDto
  ): Promise<Result<DecisionScenarioOutputDto>> {
    const validation = validateDecisionScenarioByIdQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid decision scenario id query."
      );
    }

    try {
      const scenario = await this.dependencies.decisionScenarioRepository.findById(
        validation.value,
        validation.value.id
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
