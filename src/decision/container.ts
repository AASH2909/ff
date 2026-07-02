import { createAnalyticsContextApplicationServices } from "@/analytics-context";
import { createClient } from "@/lib/supabase/server";
import { SupabasePredictionRepository } from "@/predictive/infrastructure/supabase";
import { SupabaseTimelineRepository } from "@/timeline/infrastructure/supabase";
import {
  GenerateDecisionScenariosUseCase,
  GetDecisionScenarioByIdUseCase,
  GetDecisionScenariosUseCase,
  GetLatestDecisionScenarioUseCase
} from "@/decision/application";
import { DecisionScenarioRuleEngine } from "@/decision/domain";
import { ModuleDecisionSourceRepository } from "@/decision/infrastructure/modules";
import { SupabaseDecisionScenarioRepository } from "@/decision/infrastructure/supabase";
import { DecisionController } from "@/decision/presentation/http";

export type DecisionModule = {
  controller: DecisionController;
};

export async function createDecisionModule(): Promise<DecisionModule> {
  const supabase = await createClient();
  const { getLatestAnalyticsContextUseCase } = await createAnalyticsContextApplicationServices();
  const decisionScenarioRepository = new SupabaseDecisionScenarioRepository(supabase);
  const predictionRepository = new SupabasePredictionRepository(supabase);
  const timelineRepository = new SupabaseTimelineRepository(supabase);
  const decisionSourceRepository = new ModuleDecisionSourceRepository({
    getLatestAnalyticsContextUseCase,
    predictionRepository,
    timelineRepository
  });
  const readDependencies = {
    decisionScenarioRepository
  };
  const generateDependencies = {
    decisionScenarioRepository,
    decisionSourceRepository,
    decisionScenarioRuleEngine: new DecisionScenarioRuleEngine()
  };

  return {
    controller: new DecisionController({
      generateDecisionScenariosUseCase: new GenerateDecisionScenariosUseCase(generateDependencies),
      getDecisionScenariosUseCase: new GetDecisionScenariosUseCase(readDependencies),
      getLatestDecisionScenarioUseCase: new GetLatestDecisionScenarioUseCase(readDependencies),
      getDecisionScenarioByIdUseCase: new GetDecisionScenarioByIdUseCase(readDependencies)
    })
  };
}
