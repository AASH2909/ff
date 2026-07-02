import { fail, type ApplicationError, type Result } from "@/application/result";
import type { RecommendationContextRepository } from "@/recommendation/application/repositories";
import type { RecommendationReadScope } from "@/recommendation/application/repositories";
import { RecommendationRuleEngine } from "@/recommendation/domain";

export type RecommendationUseCaseDependencies = {
  recommendationContextRepository: RecommendationContextRepository;
  recommendationRuleEngine?: RecommendationRuleEngine;
};

export async function loadRecommendationContext(
  repository: RecommendationContextRepository,
  scope: RecommendationReadScope
) {
  const context = await repository.loadContext(scope);

  if (!context) {
    return fail("NOT_FOUND", "Recommendation source data was not found for this scope.");
  }

  return {
    ok: true,
    value: context
  } satisfies Result<NonNullable<typeof context>>;
}

export function getRecommendationRuleEngine(
  dependencies: RecommendationUseCaseDependencies
) {
  return dependencies.recommendationRuleEngine ?? new RecommendationRuleEngine();
}

export function mapUnexpectedRecommendationError(error: unknown): ApplicationError {
  void error;

  return {
    code: "PERSISTENCE_ERROR",
    message: "Unable to load executive recommendations."
  };
}
