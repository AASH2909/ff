import type { GetLatestAnalyticsContextUseCase } from "@/analytics-context/application";
import type {
  PredictionContextReadQuery,
  PredictionContextRepository
} from "@/predictive/application";

export class AnalyticsContextPredictionContextRepository implements PredictionContextRepository {
  constructor(private readonly getLatestAnalyticsContextUseCase: GetLatestAnalyticsContextUseCase) {}

  async load(query: PredictionContextReadQuery) {
    const result = await this.getLatestAnalyticsContextUseCase.execute({
      tenantId: query.tenantId,
      businessUnitId: query.businessUnitId,
      limit: query.limit
    });

    if (!result.ok) {
      throw new Error(result.error.message);
    }

    return result.value.context;
  }
}
