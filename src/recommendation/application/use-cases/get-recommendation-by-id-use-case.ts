import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  RecommendationByIdQueryDto,
  RecommendationDetailOutputDto
} from "@/recommendation/application/dtos";
import { toRecommendationDto } from "@/recommendation/application/dtos";
import { validateRecommendationByIdQuery } from "@/recommendation/application/validation";
import {
  getRecommendationRuleEngine,
  loadRecommendationContext,
  mapUnexpectedRecommendationError,
  type RecommendationUseCaseDependencies
} from "@/recommendation/application/use-cases/recommendation-use-case-helpers";

export class GetRecommendationByIdUseCase
  implements UseCase<RecommendationByIdQueryDto, RecommendationDetailOutputDto>
{
  constructor(private readonly dependencies: RecommendationUseCaseDependencies) {}

  async execute(
    input: RecommendationByIdQueryDto
  ): Promise<Result<RecommendationDetailOutputDto>> {
    const validation = validateRecommendationByIdQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid recommendation query."
      );
    }

    try {
      const { tenantId, businessUnitId, id } = validation.value;
      const context = await loadRecommendationContext(
        this.dependencies.recommendationContextRepository,
        { tenantId, businessUnitId }
      );

      if (!context.ok) {
        return context;
      }

      const recommendation = getRecommendationRuleEngine(this.dependencies)
        .generate(context.value)
        .find((candidate) => candidate.id === id);

      if (!recommendation) {
        return fail("NOT_FOUND", "Recommendation was not found for this scope.");
      }

      return ok({ recommendation: toRecommendationDto(recommendation) });
    } catch (error) {
      const mappedError = mapUnexpectedRecommendationError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
