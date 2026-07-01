import type {
  ControlScoreSnapshot,
  DashboardAlert,
  DashboardAlertSeverity,
  DashboardInsight,
  DomainScoreSnapshot,
  ScoreExplanation,
  ScoreTrendDirection,
  ScoreTrendPoint
} from "@/dashboard/domain";

export type DashboardScopeDto = {
  tenantId: string;
  businessUnitId?: string;
};

export type DashboardDateRangeDto = {
  from?: string;
  to?: string;
  limit?: number;
};

export type DashboardQueryDto = DashboardScopeDto & DashboardDateRangeDto;

export type ControlScoreDto = {
  id: string;
  tenantId: string;
  businessUnitId: string;
  businessUnitName: string | null;
  score: number;
  status: string;
  previousScore: number | null;
  scoreChange: number | null;
  periodStart: string;
  periodEnd: string;
  calculatedAt: string;
};

export type ScoreTrendPointDto = {
  controlScoreId: string;
  score: number;
  status: string;
  direction: ScoreTrendDirection;
  periodStart: string;
  periodEnd: string;
  calculatedAt: string;
};

export type DomainScoreDto = {
  domainCode: string;
  domainName: string;
  score: number;
  weight: number;
  contribution: number;
  trend: ScoreTrendDirection;
  scoreChange: number | null;
  ranking: number;
};

export type DomainChangeDto = {
  domainCode: string;
  domainName: string;
  previousScore: number;
  currentScore: number;
  scoreChange: number;
  trend: "up" | "down";
};

export type DashboardInsightDto = {
  id: string;
  type: "positive" | "negative" | "risk" | "neutral";
  severity: DashboardAlertSeverity;
  title: string;
  description: string;
  contribution: number;
  domainCode: string | null;
  metricCode: string | null;
  generatedAt: string;
};

export type DashboardAlertDto = {
  id: string;
  severity: DashboardAlertSeverity;
  status: "active" | "acknowledged" | "resolved";
  title: string;
  message: string;
  source: "control_score" | "dashboard" | "fraud" | "audit" | "operations";
  domainCode: string | null;
  metricCode: string | null;
  businessUnitId: string | null;
  resourceType: string | null;
  resourceId: string | null;
  occurredAt: string;
};

export type ScoreExplanationDto = {
  id: string;
  domainCode: string | null;
  metricCode: string | null;
  metricName: string | null;
  driverType: "positive" | "negative" | "risk" | "neutral";
  contribution: number;
  severity: DashboardAlertSeverity;
  explanation: string;
  createdAt: string;
};

export type ExecutiveSummaryDto = {
  headline: string;
  scoreNarrative: string;
  riskNarrative: string;
  generatedBy: "dashboard_rules";
  aiGenerated: false;
  generatedAt: string;
};

export type DashboardOverviewDto = {
  currentControlScore: ControlScoreDto;
  domainScores: DomainScoreDto[];
  trend: ScoreTrendPointDto[];
  topPositiveDrivers: DashboardInsightDto[];
  topNegativeDrivers: DashboardInsightDto[];
  activeAlerts: DashboardAlertDto[];
  executiveSummary: ExecutiveSummaryDto;
  lastCalculationTime: string;
};

export type LatestControlScoreOutputDto = {
  controlScore: ControlScoreDto;
};

export type ControlScoreHistoryOutputDto = {
  history: ScoreTrendPointDto[];
};

export type DomainBreakdownOutputDto = {
  controlScore: ControlScoreDto;
  domains: DomainScoreDto[];
};

export type DashboardAlertsOutputDto = {
  alerts: DashboardAlertDto[];
};

export type DashboardInsightsOutputDto = {
  controlScore: ControlScoreDto;
  scoreChange: number | null;
  explanations: ScoreExplanationDto[];
  insights: DashboardInsightDto[];
  improvedDomains: DomainChangeDto[];
  deterioratedDomains: DomainChangeDto[];
  executiveAttentionRisks: DashboardInsightDto[];
};

export function toControlScoreDto(
  score: ControlScoreSnapshot,
  previous: ControlScoreSnapshot | null
): ControlScoreDto {
  return {
    id: score.id,
    tenantId: score.tenantId,
    businessUnitId: score.businessUnitId,
    businessUnitName: score.businessUnitName,
    score: score.score,
    status: score.status,
    previousScore: previous?.score ?? null,
    scoreChange: score.getScoreChange(previous),
    periodStart: score.periodStart.toISOString(),
    periodEnd: score.periodEnd.toISOString(),
    calculatedAt: score.calculatedAt.toISOString()
  };
}

export function toTrendPointDto(
  point: ScoreTrendPoint,
  previous: ScoreTrendPoint | null
): ScoreTrendPointDto {
  return {
    controlScoreId: point.controlScoreId,
    score: point.score,
    status: point.status,
    direction: point.getDirection(previous),
    periodStart: point.periodStart.toISOString(),
    periodEnd: point.periodEnd.toISOString(),
    calculatedAt: point.calculatedAt.toISOString()
  };
}

export function toDomainScoreDto(
  domainScore: DomainScoreSnapshot,
  previous: DomainScoreSnapshot | null,
  ranking: number
): DomainScoreDto {
  return {
    domainCode: domainScore.domainCode,
    domainName: domainScore.domainName,
    score: domainScore.score,
    weight: domainScore.weight,
    contribution: domainScore.contribution,
    trend: domainScore.getTrend(previous),
    scoreChange: domainScore.getScoreChange(previous),
    ranking
  };
}

export function toDashboardInsightDto(insight: DashboardInsight): DashboardInsightDto {
  return {
    id: insight.id,
    type: insight.type,
    severity: insight.severity,
    title: insight.title,
    description: insight.description,
    contribution: insight.contribution,
    domainCode: insight.domainCode,
    metricCode: insight.metricCode,
    generatedAt: insight.generatedAt.toISOString()
  };
}

export function toDashboardAlertDto(alert: DashboardAlert): DashboardAlertDto {
  return {
    id: alert.id,
    severity: alert.severity,
    status: alert.status,
    title: alert.title,
    message: alert.message,
    source: alert.source,
    domainCode: alert.domainCode,
    metricCode: alert.metricCode,
    businessUnitId: alert.businessUnitId,
    resourceType: alert.resourceType,
    resourceId: alert.resourceId,
    occurredAt: alert.occurredAt.toISOString()
  };
}

export function toScoreExplanationDto(explanation: ScoreExplanation): ScoreExplanationDto {
  return {
    id: explanation.id,
    domainCode: explanation.domainCode,
    metricCode: explanation.metricCode,
    metricName: explanation.metricName,
    driverType: explanation.driverType,
    contribution: explanation.contribution,
    severity: explanation.severity,
    explanation: explanation.explanation,
    createdAt: explanation.createdAt.toISOString()
  };
}
