import { createAnalyticsContextApplicationServices } from "@/analytics-context";
import { createClient } from "@/lib/supabase/server";
import { SupabasePredictionRepository } from "@/predictive/infrastructure/supabase";
import {
  GetLatestTimelineUseCase,
  GetTimelineEntryUseCase,
  GetTimelineGraphUseCase,
  GetTimelineUseCase
} from "@/timeline/application";
import { TimelineBuilder } from "@/timeline/domain";
import { ModuleTimelineSourceRepository } from "@/timeline/infrastructure/modules";
import { SupabaseTimelineRepository } from "@/timeline/infrastructure/supabase";
import { TimelineController } from "@/timeline/presentation/http";

export type TimelineModule = {
  controller: TimelineController;
};

export async function createTimelineModule(): Promise<TimelineModule> {
  const supabase = await createClient();
  const { getLatestAnalyticsContextUseCase } = await createAnalyticsContextApplicationServices();
  const predictionRepository = new SupabasePredictionRepository(supabase);
  const timelineRepository = new SupabaseTimelineRepository(supabase);
  const timelineSourceRepository = new ModuleTimelineSourceRepository({
    getLatestAnalyticsContextUseCase,
    predictionRepository
  });
  const buildDependencies = {
    timelineRepository,
    timelineSourceRepository,
    timelineBuilder: new TimelineBuilder()
  };
  const readDependencies = {
    timelineRepository
  };

  return {
    controller: new TimelineController({
      getTimelineUseCase: new GetTimelineUseCase(buildDependencies),
      getLatestTimelineUseCase: new GetLatestTimelineUseCase(buildDependencies),
      getTimelineEntryUseCase: new GetTimelineEntryUseCase(readDependencies),
      getTimelineGraphUseCase: new GetTimelineGraphUseCase(readDependencies)
    })
  };
}
