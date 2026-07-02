import type { AnalyticsContextDto } from "@/analytics-context/application";
import type { PredictionDto } from "@/predictive/application";
import type { TimelineEntryDto } from "@/timeline/application";
import type { DecisionScenarioDto } from "@/decision/application";

export type CopilotContextReadQuery = {
  tenantId: string;
  businessUnitId?: string;
  limit: number;
};

export type CopilotCollectedContext = {
  analyticsContext: AnalyticsContextDto | null;
  predictions: PredictionDto[];
  timeline: TimelineEntryDto[];
  decisionScenarios: DecisionScenarioDto[];
  sourceWarnings: string[];
};

export interface CopilotContextProvider {
  load(query: CopilotContextReadQuery): Promise<CopilotCollectedContext>;
}
