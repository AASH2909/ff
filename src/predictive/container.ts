import { createAnalyticsContextApplicationServices } from "@/analytics-context";
import {
  GetLatestPredictionUseCase,
  GetPredictionByIdUseCase,
  GetPredictionsUseCase
} from "@/predictive/application";
import { PredictionRuleEngine } from "@/predictive/domain";
import { AnalyticsContextPredictionContextRepository } from "@/predictive/infrastructure/analytics-context";
import { PredictionController } from "@/predictive/presentation/http";

export type PredictiveModule = {
  controller: PredictionController;
};

export async function createPredictiveModule(): Promise<PredictiveModule> {
  const { getLatestAnalyticsContextUseCase } = await createAnalyticsContextApplicationServices();
  const predictionContextRepository = new AnalyticsContextPredictionContextRepository(
    getLatestAnalyticsContextUseCase
  );
  const dependencies = {
    predictionContextRepository,
    predictionRuleEngine: new PredictionRuleEngine()
  };

  return {
    controller: new PredictionController({
      getPredictionsUseCase: new GetPredictionsUseCase(dependencies),
      getLatestPredictionUseCase: new GetLatestPredictionUseCase(dependencies),
      getPredictionByIdUseCase: new GetPredictionByIdUseCase(dependencies)
    })
  };
}
