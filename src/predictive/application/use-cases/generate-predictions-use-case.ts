import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  GeneratePredictionsCommandDto,
  PredictionsOutputDto
} from "@/predictive/application/dtos";
import { toPredictionDto } from "@/predictive/application/dtos";
import { validateGeneratePredictionsCommand } from "@/predictive/application/validation";
import { sortPredictions } from "@/predictive/domain";
import {
  getPredictionClock,
  getPredictionRuleEngine,
  mapUnexpectedPredictionError,
  type GeneratePredictionsUseCaseDependencies
} from "@/predictive/application/use-cases/prediction-use-case-helpers";

export class GeneratePredictionsUseCase
  implements UseCase<GeneratePredictionsCommandDto, PredictionsOutputDto>
{
  constructor(private readonly dependencies: GeneratePredictionsUseCaseDependencies) {}

  async execute(input: GeneratePredictionsCommandDto): Promise<Result<PredictionsOutputDto>> {
    const validation = validateGeneratePredictionsCommand(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid prediction generation command."
      );
    }

    try {
      const { tenantId, businessUnitId, predictionWindow, limit } = validation.value;
      const context = await this.dependencies.predictionContextRepository.load({
        tenantId,
        businessUnitId,
        limit
      });
      const predictions = sortPredictions(
        getPredictionRuleEngine(this.dependencies).generate({
          context,
          predictionWindow,
          createdAt: getPredictionClock(this.dependencies).now()
        })
      ).slice(0, limit);

      await this.dependencies.predictionRepository.saveMany(predictions);

      return ok({
        predictions: predictions.map(toPredictionDto)
      });
    } catch (error) {
      const mappedError = mapUnexpectedPredictionError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
