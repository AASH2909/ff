import type { AnalyticsContextDto } from "@/analytics-context/application";
import type { PredictionDto } from "@/predictive/application";
import type { TimelineEntryDto } from "@/timeline/application";

export type DecisionSourceReadScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type DecisionSourceReadQuery = DecisionSourceReadScope & {
  limit: number;
};

export type DecisionSourceSnapshot = {
  context: AnalyticsContextDto;
  predictions: PredictionDto[];
  timelineEntries: TimelineEntryDto[];
};

export interface DecisionSourceRepository {
  load(query: DecisionSourceReadQuery): Promise<DecisionSourceSnapshot>;
}
