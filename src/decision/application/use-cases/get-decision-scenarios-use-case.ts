import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  DecisionScenarioQueryDto,
  DecisionScenariosOutputDto
} from "@/decision/application/dtos";
import { toDecisionScenarioDto } from "@/decision/application/dtos";
import { validateDecisionScenarioQuery } from "@/decision/application/validation";
import {
  mapUnexpectedDecisionError,
  type DecisionUseCaseCommonDependencies
} from "@/decision/application/use-cases/decision-use-case-helpers";

export class GetDecisionScenariosUseCase
  implements UseCase<DecisionScenarioQueryDto, DecisionScenariosOutputDto>
{
  constructor(private readonly dependencies: DecisionUseCaseCommonDependencies) {}

  async execute(input: DecisionScenarioQueryDto): Promise<Result<DecisionScenariosOutputDto>> {
    const validation = validateDecisionScenarioQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid decision scenario query."
      );
    }

    try {
      const scenarios = await this.dependencies.decisionScenarioRepository.findMany(
        validation.value
      );

      return ok({
        scenarios: scenarios.map(toDecisionScenarioDto)
      });
    } catch (error) {
      const mappedError = mapUnexpectedDecisionError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
