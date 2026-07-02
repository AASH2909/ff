import type { GetLatestAnalyticsContextUseCase } from "@/analytics-context/application";
import { toPredictionDto, type PredictionRepository } from "@/predictive/application";
import { toTimelineEntryDto, type TimelineRepository } from "@/timeline/application";
import type {
  DecisionSourceReadQuery,
  DecisionSourceRepository
} from "@/decision/application";

export type ModuleDecisionSourceRepositoryDependencies = {
  getLatestAnalyticsContextUseCase: GetLatestAnalyticsContextUseCase;
  predictionRepository: PredictionRepository;
  timelineRepository: TimelineRepository;
};

export class ModuleDecisionSourceRepository implements DecisionSourceRepository {
  constructor(private readonly dependencies: ModuleDecisionSourceRepositoryDependencies) {}

  async load(query: DecisionSourceReadQuery) {
    const contextResult = await this.dependencies.getLatestAnalyticsContextUseCase.execute({
      tenantId: query.tenantId,
      businessUnitId: query.businessUnitId,
      limit: query.limit
    });

    if (!contextResult.ok) {
      throw new Error(contextResult.error.message);
    }

    const [predictions, timelineEntries] = await Promise.all([
      this.dependencies.predictionRepository.findMany({
        tenantId: query.tenantId,
        businessUnitId: query.businessUnitId,
        limit: query.limit
      }),
      this.dependencies.timelineRepository.findEntries({
        tenantId: query.tenantId,
        businessUnitId: query.businessUnitId,
        limit: query.limit
      })
    ]);

    return {
      context: contextResult.value.context,
      predictions: predictions.map(toPredictionDto),
      timelineEntries: timelineEntries.map(toTimelineEntryDto)
    };
  }
}
