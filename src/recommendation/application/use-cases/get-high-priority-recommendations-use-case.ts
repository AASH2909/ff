import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  RecommendationQueryDto,
  RecommendationsOutputDto
} from "@/recommendation/application/dtos";
import { toRecommendationDto } from "@/recommendation/application/dtos";
import { validateRecommendationQuery } from "@/recommendation/application/validation";
import {
  getRecommendationRuleEngine,
  loadRecommendationContext,
  mapUnexpectedRecommendationError,
  type RecommendationUseCaseDependencies
} from "@/recommendation/application/use-cases/recommendation-use-case-helpers";

export class GetHighPriorityRecommendationsUseCase
  implements UseCase<RecommendationQueryDto, RecommendationsOutputDto>
{
  constructor(private readonly dependencies: RecommendationUseCaseDependencies) {}

  async execute(input: RecommendationQueryDto): Promise<Result<RecommendationsOutputDto>> {
    const validation = validateRecommendationQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid recommendation query."
      );
    }

    try {
      const { tenantId, businessUnitId, limit } = validation.value;
      const context = await loadRecommendationContext(
        this.dependencies.recommendationContextRepository,
        { tenantId, businessUnitId }
      );

      if (!context.ok) {
        return context;
      }

      const recommendations = getRecommendationRuleEngine(this.dependencies)
        .generate(context.value)
        .filter(
          (recommendation) =>
            recommendation.priority === "HIGH" || recommendation.priority === "CRITICAL"
        )
        .slice(0, limit)
        .map(toRecommendationDto);

      return ok({ recommendations });
    } catch (error) {
      const mappedError = mapUnexpectedRecommendationError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
