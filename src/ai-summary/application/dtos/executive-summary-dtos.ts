import type {
  ExecutiveSummary,
  ExecutiveSummaryMetadata,
  ExecutiveSummaryStatus,
  ExecutiveSummaryType
} from "@/ai-summary/domain";

export type ExecutiveSummaryScopeDto = {
  tenantId: string;
  businessUnitId?: string;
};

export type GenerateExecutiveSummaryDto = ExecutiveSummaryScopeDto & {
  summaryType?: string;
  periodStart?: string;
  periodEnd?: string;
};

export type ExecutiveSummaryByIdQueryDto = ExecutiveSummaryScopeDto & {
  id: string;
};

export type ExecutiveSummaryLatestQueryDto = ExecutiveSummaryScopeDto & {
  summaryType?: string;
};

export type ExecutiveSummaryHistoryQueryDto = ExecutiveSummaryScopeDto & {
  summaryType?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export type ExecutiveSummaryDto = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  periodStart: string;
  periodEnd: string;
  summaryType: ExecutiveSummaryType;
  status: ExecutiveSummaryStatus;
  headline: string;
  overallAssessment: string;
  keyPositiveSignals: string[];
  keyNegativeSignals: string[];
  criticalRisks: string[];
  recommendedActions: string[];
  confidence: number;
  sourceModules: string[];
  generatedAt: string;
  metadata: ExecutiveSummaryMetadata;
};

export type ExecutiveSummaryOutputDto = {
  summary: ExecutiveSummaryDto;
};

export type ExecutiveSummaryHistoryOutputDto = {
  summaries: ExecutiveSummaryDto[];
};

export function toExecutiveSummaryDto(summary: ExecutiveSummary): ExecutiveSummaryDto {
  return {
    id: summary.id,
    tenantId: summary.tenantId,
    businessUnitId: summary.businessUnitId,
    periodStart: summary.periodStart.toISOString(),
    periodEnd: summary.periodEnd.toISOString(),
    summaryType: summary.summaryType,
    status: summary.status,
    headline: summary.headline,
    overallAssessment: summary.overallAssessment,
    keyPositiveSignals: summary.keyPositiveSignals,
    keyNegativeSignals: summary.keyNegativeSignals,
    criticalRisks: summary.criticalRisks,
    recommendedActions: summary.recommendedActions,
    confidence: summary.confidence,
    sourceModules: summary.sourceModules,
    generatedAt: summary.generatedAt.toISOString(),
    metadata: summary.metadata
  };
}
