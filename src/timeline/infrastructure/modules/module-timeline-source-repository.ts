import type { GetLatestAnalyticsContextUseCase } from "@/analytics-context/application";
import type { PredictionRepository } from "@/predictive/application";
import { toPredictionDto } from "@/predictive/application";
import type {
  TimelineSourceReadQuery,
  TimelineSourceRepository
} from "@/timeline/application";

export class ModuleTimelineSourceRepository implements TimelineSourceRepository {
  constructor(
    private readonly dependencies: {
      getLatestAnalyticsContextUseCase: GetLatestAnalyticsContextUseCase;
      predictionRepository: PredictionRepository;
    }
  ) {}

  async load(query: TimelineSourceReadQuery) {
    const contextResult = await this.dependencies.getLatestAnalyticsContextUseCase.execute({
      tenantId: query.tenantId,
      businessUnitId: query.businessUnitId,
      limit: query.limit
    });

    if (!contextResult.ok) {
      throw new Error(contextResult.error.message);
    }

    const predictions = await this.dependencies.predictionRepository.findMany({
      tenantId: query.tenantId,
      businessUnitId: query.businessUnitId,
      limit: query.limit
    });

    return {
      context: contextResult.value.context,
      predictions: predictions.map(toPredictionDto)
    };
  }
}
