import type { AnalyticsContextDto } from "@/analytics-context/application";

export type PredictionContextReadQuery = {
  tenantId: string;
  businessUnitId?: string;
  limit: number;
};

export interface PredictionContextRepository {
  load(query: PredictionContextReadQuery): Promise<AnalyticsContextDto>;
}
