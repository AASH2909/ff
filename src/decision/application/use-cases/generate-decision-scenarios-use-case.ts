import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  DecisionScenariosOutputDto,
  GenerateDecisionScenariosCommandDto
} from "@/decision/application/dtos";
import { toDecisionScenarioDto } from "@/decision/application/dtos";
import { validateGenerateDecisionScenariosCommand } from "@/decision/application/validation";
import { sortDecisionScenarios } from "@/decision/domain";
import {
  getDecisionClock,
  getDecisionScenarioRuleEngine,
  mapUnexpectedDecisionError,
  type GenerateDecisionScenariosUseCaseDependencies
} from "@/decision/application/use-cases/decision-use-case-helpers";

export class GenerateDecisionScenariosUseCase
  implements UseCase<GenerateDecisionScenariosCommandDto, DecisionScenariosOutputDto>
{
  constructor(private readonly dependencies: GenerateDecisionScenariosUseCaseDependencies) {}

  async execute(
    input: GenerateDecisionScenariosCommandDto
  ): Promise<Result<DecisionScenariosOutputDto>> {
    const validation = validateGenerateDecisionScenariosCommand(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid decision scenario generation command."
      );
    }

    try {
      const { tenantId, businessUnitId, limit } = validation.value;
      const source = await this.dependencies.decisionSourceRepository.load({
        tenantId,
        businessUnitId,
        limit
      });
      const scenarios = sortDecisionScenarios(
        getDecisionScenarioRuleEngine(this.dependencies).generate({
          ...source,
          createdAt: getDecisionClock(this.dependencies).now()
        })
      ).slice(0, limit);

      await this.dependencies.decisionScenarioRepository.saveMany(scenarios);

      return ok({
        scenarios: scenarios.map(toDecisionScenarioDto)
      });
    } catch (error) {
      const mappedError = mapUnexpectedDecisionError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
