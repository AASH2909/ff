import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type { PredictionQueryDto, PredictionsOutputDto } from "@/predictive/application/dtos";
import { toPredictionDto } from "@/predictive/application/dtos";
import { validatePredictionQuery } from "@/predictive/application/validation";
import { sortPredictions } from "@/predictive/domain";
import {
  mapUnexpectedPredictionError,
  type PredictionUseCaseCommonDependencies
} from "@/predictive/application/use-cases/prediction-use-case-helpers";

export class GetPredictionsUseCase
  implements UseCase<PredictionQueryDto, PredictionsOutputDto>
{
  constructor(private readonly dependencies: PredictionUseCaseCommonDependencies) {}

  async execute(input: PredictionQueryDto): Promise<Result<PredictionsOutputDto>> {
    const validation = validatePredictionQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid prediction query."
      );
    }

    try {
      const predictions = await this.dependencies.predictionRepository.findMany(validation.value);

      return ok({
        predictions: sortPredictions(predictions).map(toPredictionDto)
      });
    } catch (error) {
      const mappedError = mapUnexpectedPredictionError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
