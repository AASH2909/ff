import type { AnalyticsContextDto } from "@/analytics-context/application";
import type { PredictionDto } from "@/predictive/application";

export type TimelineSourceReadQuery = {
  tenantId: string;
  businessUnitId?: string;
  limit: number;
};

export type TimelineSourceSnapshot = {
  context: AnalyticsContextDto;
  predictions: PredictionDto[];
};

export interface TimelineSourceRepository {
  load(query: TimelineSourceReadQuery): Promise<TimelineSourceSnapshot>;
}
