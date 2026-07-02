import { createClient } from "@/lib/supabase/server";
import { SupabaseDashboardReadRepository } from "@/dashboard/infrastructure/supabase";
import {
  GetHighPriorityRecommendationsUseCase,
  GetRecommendationByIdUseCase,
  GetRecommendationsUseCase
} from "@/recommendation/application";
import { RecommendationRuleEngine } from "@/recommendation/domain";
import { DashboardRecommendationContextRepository } from "@/recommendation/infrastructure/dashboard";
import { RecommendationController } from "@/recommendation/presentation/http";

export type RecommendationModule = {
  controller: RecommendationController;
};

export async function createRecommendationModule(): Promise<RecommendationModule> {
  const supabase = await createClient();
  const dashboardReadRepository = new SupabaseDashboardReadRepository(supabase);
  const recommendationContextRepository = new DashboardRecommendationContextRepository(
    dashboardReadRepository
  );
  const recommendationRuleEngine = new RecommendationRuleEngine();
  const dependencies = {
    recommendationContextRepository,
    recommendationRuleEngine
  };

  return {
    controller: new RecommendationController({
      getRecommendationsUseCase: new GetRecommendationsUseCase(dependencies),
      getHighPriorityRecommendationsUseCase: new GetHighPriorityRecommendationsUseCase(
        dependencies
      ),
      getRecommendationByIdUseCase: new GetRecommendationByIdUseCase(dependencies)
    })
  };
}
