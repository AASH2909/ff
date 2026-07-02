import type { IdGenerator } from "@/application/ports/id-generator";
import { createClient } from "@/lib/supabase/server";
import { SupabaseDashboardReadRepository } from "@/dashboard/infrastructure/supabase";
import { DashboardRecommendationContextRepository } from "@/recommendation/infrastructure/dashboard";
import { RecommendationRuleEngine } from "@/recommendation/domain";
import {
  GenerateExecutiveSummaryUseCase,
  GetExecutiveSummaryByIdUseCase,
  GetExecutiveSummaryHistoryUseCase,
  GetLatestExecutiveSummaryUseCase
} from "@/ai-summary/application";
import { DeterministicExecutiveSummaryBuilder } from "@/ai-summary/domain";
import { RecommendationExecutiveSummarySourceRepository } from "@/ai-summary/infrastructure/recommendation";
import { SupabaseExecutiveSummaryRepository } from "@/ai-summary/infrastructure/supabase";
import { AISummaryController } from "@/ai-summary/presentation/http";

export type AISummaryModule = {
  controller: AISummaryController;
};

export async function createAISummaryModule(): Promise<AISummaryModule> {
  const supabase = await createClient();
  const dashboardReadRepository = new SupabaseDashboardReadRepository(supabase);
  const recommendationContextRepository = new DashboardRecommendationContextRepository(
    dashboardReadRepository
  );
  const recommendationRuleEngine = new RecommendationRuleEngine();
  const executiveSummaryRepository = new SupabaseExecutiveSummaryRepository(supabase);
  const executiveSummarySourceRepository = new RecommendationExecutiveSummarySourceRepository(
    recommendationContextRepository,
    recommendationRuleEngine
  );
  const generateDependencies = {
    executiveSummaryRepository,
    executiveSummarySourceRepository,
    summaryBuilder: new DeterministicExecutiveSummaryBuilder(),
    idGenerator: uuidGenerator
  };

  return {
    controller: new AISummaryController({
      generateExecutiveSummaryUseCase: new GenerateExecutiveSummaryUseCase(generateDependencies),
      getLatestExecutiveSummaryUseCase: new GetLatestExecutiveSummaryUseCase({
        executiveSummaryRepository
      }),
      getExecutiveSummaryByIdUseCase: new GetExecutiveSummaryByIdUseCase({
        executiveSummaryRepository
      }),
      getExecutiveSummaryHistoryUseCase: new GetExecutiveSummaryHistoryUseCase({
        executiveSummaryRepository
      })
    })
  };
}

const uuidGenerator: IdGenerator = {
  nextId: () => crypto.randomUUID()
};
