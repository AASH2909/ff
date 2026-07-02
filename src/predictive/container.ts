import { createAnalyticsContextApplicationServices } from "@/analytics-context";
import { createClient } from "@/lib/supabase/server";
import {
  GeneratePredictionsUseCase,
  GetLatestPredictionUseCase,
  GetPredictionByIdUseCase,
  GetPredictionsUseCase
} from "@/predictive/application";
import { PredictionRuleEngine } from "@/predictive/domain";
import { AnalyticsContextPredictionContextRepository } from "@/predictive/infrastructure/analytics-context";
import { SupabasePredictionRepository } from "@/predictive/infrastructure/supabase";
import { PredictionController } from "@/predictive/presentation/http";

export type PredictiveModule = {
  controller: PredictionController;
};

export async function createPredictiveModule(): Promise<PredictiveModule> {
  const { getLatestAnalyticsContextUseCase } = await createAnalyticsContextApplicationServices();
  const supabase = await createClient();
  const predictionRepository = new SupabasePredictionRepository(supabase);
  const predictionContextRepository = new AnalyticsContextPredictionContextRepository(
    getLatestAnalyticsContextUseCase
  );
  const readDependencies = {
    predictionRepository
  };
  const generateDependencies = {
    predictionRepository,
    predictionContextRepository,
    predictionRuleEngine: new PredictionRuleEngine()
  };

  return {
    controller: new PredictionController({
      generatePredictionsUseCase: new GeneratePredictionsUseCase(generateDependencies),
      getPredictionsUseCase: new GetPredictionsUseCase(readDependencies),
      getLatestPredictionUseCase: new GetLatestPredictionUseCase(readDependencies),
      getPredictionByIdUseCase: new GetPredictionByIdUseCase(readDependencies)
    })
  };
}
