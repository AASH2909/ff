import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type { PredictionOutputDto, PredictionQueryDto } from "@/predictive/application/dtos";
import { toPredictionDto } from "@/predictive/application/dtos";
import { validatePredictionQuery } from "@/predictive/application/validation";
import { sortPredictions } from "@/predictive/domain";
import {
  getPredictionClock,
  getPredictionRuleEngine,
  mapUnexpectedPredictionError,
  type PredictionUseCaseCommonDependencies
} from "@/predictive/application/use-cases/prediction-use-case-helpers";

export class GetLatestPredictionUseCase
  implements UseCase<PredictionQueryDto, PredictionOutputDto>
{
  constructor(private readonly dependencies: PredictionUseCaseCommonDependencies) {}

  async execute(input: PredictionQueryDto): Promise<Result<PredictionOutputDto>> {
    const validation = validatePredictionQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid latest prediction query."
      );
    }

    try {
      const { tenantId, businessUnitId, predictionType, predictionWindow, limit } =
        validation.value;
      const context = await this.dependencies.predictionContextRepository.load({
        tenantId,
        businessUnitId,
        limit
      });
      const prediction = sortPredictions(
        getPredictionRuleEngine(this.dependencies).generate({
          context,
          predictionWindow,
          generatedAt: getPredictionClock(this.dependencies).now()
        })
      ).find((candidate) => !predictionType || candidate.predictionType === predictionType);

      if (!prediction) {
        return fail("NOT_FOUND", "Prediction was not found for this scope.");
      }

      return ok({
        prediction: toPredictionDto(prediction)
      });
    } catch (error) {
      const mappedError = mapUnexpectedPredictionError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
