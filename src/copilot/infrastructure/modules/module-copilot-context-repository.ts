import type { GetLatestAnalyticsContextUseCase } from "@/analytics-context/application";
import type { PredictionRepository } from "@/predictive/application";
import { toPredictionDto } from "@/predictive/application";
import { sortPredictions } from "@/predictive/domain";
import type { TimelineRepository } from "@/timeline/application";
import { toTimelineEntryDto } from "@/timeline/application";
import type { DecisionScenarioRepository } from "@/decision/application";
import { toDecisionScenarioDto } from "@/decision/application";
import type {
  CopilotCollectedContext,
  CopilotContextReadQuery,
  CopilotContextRepository
} from "@/copilot/application";

export type ModuleCopilotContextRepositoryDependencies = {
  getLatestAnalyticsContextUseCase: GetLatestAnalyticsContextUseCase;
  predictionRepository: PredictionRepository;
  timelineRepository: TimelineRepository;
  decisionScenarioRepository: DecisionScenarioRepository;
};

export class ModuleCopilotContextRepository implements CopilotContextRepository {
  constructor(private readonly dependencies: ModuleCopilotContextRepositoryDependencies) {}

  async load(query: CopilotContextReadQuery): Promise<CopilotCollectedContext> {
    const sourceWarnings: string[] = [];
    const [analyticsContext, predictions, timeline, decisionScenarios] = await Promise.all([
      this.loadAnalyticsContext(query, sourceWarnings),
      this.loadPredictions(query, sourceWarnings),
      this.loadTimeline(query, sourceWarnings),
      this.loadDecisionScenarios(query, sourceWarnings)
    ]);

    return {
      analyticsContext,
      predictions,
      timeline,
      decisionScenarios,
      sourceWarnings
    };
  }

  private async loadAnalyticsContext(
    query: CopilotContextReadQuery,
    sourceWarnings: string[]
  ) {
    const result = await this.dependencies.getLatestAnalyticsContextUseCase.execute({
      tenantId: query.tenantId,
      businessUnitId: query.businessUnitId,
      limit: query.limit
    });

    if (result.ok) {
      return result.value.context;
    }

    sourceWarnings.push(`analytics_context: ${result.error.message}`);
    return null;
  }

  private async loadPredictions(
    query: CopilotContextReadQuery,
    sourceWarnings: string[]
  ) {
    try {
      const predictions = await this.dependencies.predictionRepository.findMany({
        tenantId: query.tenantId,
        businessUnitId: query.businessUnitId,
        limit: query.limit
      });

      return sortPredictions(predictions).map(toPredictionDto);
    } catch (error) {
      void error;
      sourceWarnings.push("predictive: unavailable");
      return [];
    }
  }

  private async loadTimeline(query: CopilotContextReadQuery, sourceWarnings: string[]) {
    try {
      const entries = await this.dependencies.timelineRepository.findEntries({
        tenantId: query.tenantId,
        businessUnitId: query.businessUnitId,
        limit: query.limit
      });

      return entries.map(toTimelineEntryDto);
    } catch (error) {
      void error;
      sourceWarnings.push("timeline: unavailable");
      return [];
    }
  }

  private async loadDecisionScenarios(
    query: CopilotContextReadQuery,
    sourceWarnings: string[]
  ) {
    try {
      const scenarios = await this.dependencies.decisionScenarioRepository.findMany({
        tenantId: query.tenantId,
        businessUnitId: query.businessUnitId,
        limit: query.limit
      });

      return scenarios.map(toDecisionScenarioDto);
    } catch (error) {
      void error;
      sourceWarnings.push("decision: unavailable");
      return [];
    }
  }
}
