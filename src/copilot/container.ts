import type { IdGenerator } from "@/application/ports/id-generator";
import { createAnalyticsContextApplicationServices } from "@/analytics-context";
import { CopilotEngine, CopilotIntentClassifier } from "@/copilot/domain";
import {
  AskCopilotUseCase,
  GetCopilotMessagesUseCase,
  GetCopilotSessionByIdUseCase,
  GetCopilotSessionsUseCase
} from "@/copilot/application";
import { ModuleCopilotContextRepository } from "@/copilot/infrastructure/modules";
import { SupabaseCopilotRepository } from "@/copilot/infrastructure/supabase";
import { SupabaseDecisionScenarioRepository } from "@/decision/infrastructure/supabase";
import { createClient } from "@/lib/supabase/server";
import { SupabasePredictionRepository } from "@/predictive/infrastructure/supabase";
import { SupabaseTimelineRepository } from "@/timeline/infrastructure/supabase";
import { CopilotController } from "@/copilot/presentation/http";

export type CopilotModule = {
  controller: CopilotController;
};

export async function createCopilotModule(): Promise<CopilotModule> {
  const supabase = await createClient();
  const { getLatestAnalyticsContextUseCase } = await createAnalyticsContextApplicationServices();
  const copilotRepository = new SupabaseCopilotRepository(supabase);
  const contextRepository = new ModuleCopilotContextRepository({
    getLatestAnalyticsContextUseCase,
    predictionRepository: new SupabasePredictionRepository(supabase),
    timelineRepository: new SupabaseTimelineRepository(supabase),
    decisionScenarioRepository: new SupabaseDecisionScenarioRepository(supabase)
  });
  const copilotEngine = new CopilotEngine({
    contextProvider: contextRepository,
    idGenerator: uuidGenerator,
    classifier: new CopilotIntentClassifier()
  });
  const readDependencies = {
    copilotRepository
  };

  return {
    controller: new CopilotController({
      askCopilotUseCase: new AskCopilotUseCase({
        ...readDependencies,
        copilotEngine,
        idGenerator: uuidGenerator
      }),
      getCopilotSessionsUseCase: new GetCopilotSessionsUseCase(readDependencies),
      getCopilotSessionByIdUseCase: new GetCopilotSessionByIdUseCase(readDependencies),
      getCopilotMessagesUseCase: new GetCopilotMessagesUseCase(readDependencies)
    })
  };
}

const uuidGenerator: IdGenerator = {
  nextId: () => crypto.randomUUID()
};
