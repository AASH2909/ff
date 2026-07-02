import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  PredictionByIdQueryDto,
  PredictionOutputDto
} from "@/predictive/application/dtos";
import { toPredictionDto } from "@/predictive/application/dtos";
import { validatePredictionByIdQuery } from "@/predictive/application/validation";
import {
  getPredictionClock,
  getPredictionRuleEngine,
  mapUnexpectedPredictionError,
  type PredictionUseCaseCommonDependencies
} from "@/predictive/application/use-cases/prediction-use-case-helpers";

export class GetPredictionByIdUseCase
  implements UseCase<PredictionByIdQueryDto, PredictionOutputDto>
{
  constructor(private readonly dependencies: PredictionUseCaseCommonDependencies) {}

  async execute(input: PredictionByIdQueryDto): Promise<Result<PredictionOutputDto>> {
    const validation = validatePredictionByIdQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid prediction id query."
      );
    }

    try {
      const { tenantId, businessUnitId, id, predictionWindow } = validation.value;
      const context = await this.dependencies.predictionContextRepository.load({
        tenantId,
        businessUnitId,
        limit: 10
      });
      const prediction = getPredictionRuleEngine(this.dependencies)
        .generate({
          context,
          predictionWindow,
          generatedAt: getPredictionClock(this.dependencies).now()
        })
        .find((candidate) => candidate.id === id);

      if (!prediction) {
        return fail("NOT_FOUND", "Prediction was not found.");
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
