import {
  fail,
  ok,
  type ApplicationError,
  type Result
} from "@/application/result";
import type {
  ControlScoreSnapshot,
  DomainScoreSnapshot
} from "@/dashboard/domain";
import {
  DashboardAlert,
  DashboardTrend,
  ScoreExplanation,
  compareDashboardSeverity,
  DashboardInsight,
  ScoreTrendPoint as ScoreTrendPointEntity
} from "@/dashboard/domain";
import type {
  ControlScoreDto,
  DashboardAlertDto,
  DashboardInsightDto,
  DomainChangeDto,
  DomainScoreDto,
  ExecutiveSummaryDto,
  ScoreTrendPointDto
} from "@/dashboard/application/dtos";
import {
  toControlScoreDto,
  toDashboardAlertDto,
  toDashboardInsightDto,
  toDomainScoreDto,
  toTrendPointDto
} from "@/dashboard/application/dtos";
import type {
  DashboardReadRepository,
  DashboardReadScope
} from "@/dashboard/application/repositories";
import {
  DEFAULT_DASHBOARD_ALERT_LIMIT,
  DEFAULT_DASHBOARD_DRIVER_LIMIT
} from "@/dashboard/application/validation";

export async function loadLatestScoreContext(
  repository: DashboardReadRepository,
  scope: DashboardReadScope
): Promise<
  Result<{
    current: ControlScoreSnapshot;
    previous: ControlScoreSnapshot | null;
  }>
> {
  const current = await repository.findLatestControlScore(scope);

  if (!current) {
    return fail("NOT_FOUND", "Control Score data was not found for this dashboard scope.");
  }

  const previous = await repository.findPreviousControlScore(scope, current.calculatedAt);

  return ok({
    current,
    previous
  });
}

export function buildControlScoreDto(
  current: ControlScoreSnapshot,
  previous: ControlScoreSnapshot | null
): ControlScoreDto {
  return toControlScoreDto(current, previous);
}

export function buildTrendDtos(scores: ControlScoreSnapshot[]): ScoreTrendPointDto[] {
  const trend = new DashboardTrend({
    points: scores.map(
      (score) =>
        new ScoreTrendPointEntity({
          controlScoreId: score.id,
          score: score.score,
          status: score.status,
          periodStart: score.periodStart,
          periodEnd: score.periodEnd,
          calculatedAt: score.calculatedAt
        })
    )
  });
  const trendPoints = trend.points;

  return trendPoints.map((point, index) => toTrendPointDto(point, trendPoints[index - 1] ?? null));
}

export function buildDomainBreakdownDtos(
  currentDomains: DomainScoreSnapshot[],
  previousDomains: DomainScoreSnapshot[]
): DomainScoreDto[] {
  const previousByDomainCode = new Map(
    previousDomains.map((domainScore) => [domainScore.domainCode, domainScore])
  );

  return [...currentDomains]
    .sort((left, right) => {
      if (right.contribution === left.contribution) {
        return right.score - left.score;
      }

      return right.contribution - left.contribution;
    })
    .map((domainScore, index) =>
      toDomainScoreDto(domainScore, previousByDomainCode.get(domainScore.domainCode) ?? null, index + 1)
    );
}

export function buildDomainChangeDtos(
  currentDomains: DomainScoreSnapshot[],
  previousDomains: DomainScoreSnapshot[]
): {
  improvedDomains: DomainChangeDto[];
  deterioratedDomains: DomainChangeDto[];
} {
  const previousByDomainCode = new Map(
    previousDomains.map((domainScore) => [domainScore.domainCode, domainScore])
  );

  const changes = currentDomains.flatMap((currentDomain) => {
    const previousDomain = previousByDomainCode.get(currentDomain.domainCode);

    if (!previousDomain) {
      return [];
    }

    const scoreChange = currentDomain.getScoreChange(previousDomain);

    if (scoreChange === null || scoreChange === 0) {
      return [];
    }

    return [
      {
        domainCode: currentDomain.domainCode,
        domainName: currentDomain.domainName,
        previousScore: previousDomain.score,
        currentScore: currentDomain.score,
        scoreChange,
        trend: scoreChange > 0 ? ("up" as const) : ("down" as const)
      }
    ];
  });

  return {
    improvedDomains: changes
      .filter((change) => change.trend === "up")
      .sort((left, right) => right.scoreChange - left.scoreChange),
    deterioratedDomains: changes
      .filter((change) => change.trend === "down")
      .sort((left, right) => left.scoreChange - right.scoreChange)
  };
}

export function buildInsights(
  tenantId: string,
  controlScoreId: string,
  explanations: ScoreExplanation[],
  limit = DEFAULT_DASHBOARD_DRIVER_LIMIT
): DashboardInsightDto[] {
  return explanations
    .map((explanation) => {
      const label = buildDriverLabel(explanation);

      return new DashboardInsight({
        id: `insight:${explanation.id}`,
        tenantId,
        controlScoreId,
        type: explanation.driverType,
        severity: explanation.severity,
        title: label,
        description: explanation.explanation,
        contribution: explanation.contribution,
        domainCode: explanation.domainCode,
        metricCode: explanation.metricCode,
        generatedAt: explanation.createdAt
      });
    })
    .sort((left, right) => {
      const severityOrder = compareDashboardSeverity(left.severity, right.severity);

      if (severityOrder !== 0) {
        return severityOrder;
      }

      return Math.abs(right.contribution) - Math.abs(left.contribution);
    })
    .slice(0, limit)
    .map(toDashboardInsightDto);
}

export function buildTopPositiveDrivers(
  tenantId: string,
  controlScoreId: string,
  explanations: ScoreExplanation[]
): DashboardInsightDto[] {
  return buildInsights(
    tenantId,
    controlScoreId,
    explanations
      .filter((explanation) => explanation.driverType === "positive")
      .sort((left, right) => right.contribution - left.contribution),
    DEFAULT_DASHBOARD_DRIVER_LIMIT
  );
}

export function buildTopNegativeDrivers(
  tenantId: string,
  controlScoreId: string,
  explanations: ScoreExplanation[]
): DashboardInsightDto[] {
  return buildInsights(
    tenantId,
    controlScoreId,
    explanations
      .filter((explanation) => explanation.driverType === "negative" || explanation.driverType === "risk")
      .sort((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution)),
    DEFAULT_DASHBOARD_DRIVER_LIMIT
  );
}

export function buildExecutiveAttentionRisks(
  tenantId: string,
  controlScoreId: string,
  explanations: ScoreExplanation[]
): DashboardInsightDto[] {
  return buildInsights(
    tenantId,
    controlScoreId,
    explanations.filter(
      (explanation) =>
        explanation.driverType === "risk" ||
        explanation.severity === "critical" ||
        explanation.severity === "severe"
    ),
    DEFAULT_DASHBOARD_DRIVER_LIMIT
  );
}

export function buildAlertDtos(
  explanationAlerts: DashboardAlert[],
  persistedAlerts: DashboardAlert[],
  limit = DEFAULT_DASHBOARD_ALERT_LIMIT
): DashboardAlertDto[] {
  return [...explanationAlerts, ...persistedAlerts]
    .sort((left, right) => {
      const severityOrder = compareDashboardSeverity(left.severity, right.severity);

      if (severityOrder !== 0) {
        return severityOrder;
      }

      return right.occurredAt.getTime() - left.occurredAt.getTime();
    })
    .slice(0, limit)
    .map(toDashboardAlertDto);
}

export function buildExplanationAlerts(
  tenantId: string,
  businessUnitId: string,
  explanations: ScoreExplanation[]
): DashboardAlert[] {
  return explanations
    .filter(
      (explanation) =>
        explanation.driverType === "negative" ||
        explanation.driverType === "risk" ||
        explanation.severity === "warning" ||
        explanation.severity === "critical" ||
        explanation.severity === "severe"
    )
    .map((explanation) => ({
      explanation,
      title: buildAlertTitle(explanation)
    }))
    .map(
      ({ explanation, title }) =>
        new DashboardAlert({
          id: `score-explanation:${explanation.id}`,
          tenantId,
          businessUnitId,
          severity: explanation.severity,
          status: "active",
          title,
          message: explanation.explanation,
          source: "control_score",
          domainCode: explanation.domainCode,
          metricCode: explanation.metricCode,
          resourceType: "control_score_explanation",
          resourceId: explanation.id,
          occurredAt: explanation.createdAt
        })
    );
}

export function buildDomainResultAlerts(
  tenantId: string,
  businessUnitId: string,
  domainScores: DomainScoreSnapshot[]
): DashboardAlert[] {
  return domainScores.flatMap((domainScore) => {
    const metadataAlert = readDomainAlertMetadata(domainScore);

    if (!metadataAlert) {
      return [];
    }

    return [
      new DashboardAlert({
        id: `domain-score:${domainScore.id}`,
        tenantId,
        businessUnitId,
        severity: metadataAlert.severity,
        status: "active",
        title: metadataAlert.title,
        message: metadataAlert.message,
        source: "control_score",
        domainCode: domainScore.domainCode,
        metricCode: metadataAlert.metricCode,
        resourceType: "control_score_domain_score",
        resourceId: domainScore.id,
        occurredAt: domainScore.calculatedAt
      })
    ];
  });
}

export function buildExecutiveSummary(
  controlScore: ControlScoreDto,
  activeAlerts: DashboardAlertDto[],
  generatedAt: Date
): ExecutiveSummaryDto {
  const scoreChange = controlScore.scoreChange;
  const scoreNarrative =
    scoreChange === null
      ? "No prior Control Score is available for comparison."
      : scoreChange > 0
        ? `Control Score improved by ${scoreChange} points versus the previous calculation.`
        : scoreChange < 0
          ? `Control Score declined by ${Math.abs(scoreChange)} points versus the previous calculation.`
          : "Control Score is unchanged versus the previous calculation.";

  const severeAlertCount = activeAlerts.filter((alert) => alert.severity === "severe").length;
  const criticalAlertCount = activeAlerts.filter((alert) => alert.severity === "critical").length;
  const riskNarrative =
    severeAlertCount > 0
      ? `${severeAlertCount} severe dashboard alert${severeAlertCount === 1 ? "" : "s"} require executive attention.`
      : criticalAlertCount > 0
        ? `${criticalAlertCount} critical dashboard alert${criticalAlertCount === 1 ? "" : "s"} should be reviewed.`
        : "No severe or critical dashboard alerts are active.";

  return {
    headline: `Control Score is ${controlScore.score} with ${controlScore.status} status.`,
    scoreNarrative,
    riskNarrative,
    generatedBy: "dashboard_rules",
    aiGenerated: false,
    generatedAt: generatedAt.toISOString()
  };
}

export function mapUnexpectedDashboardError(error: unknown): ApplicationError {
  void error;

  return {
    code: "PERSISTENCE_ERROR",
    message: "Unable to load dashboard intelligence data."
  };
}

function buildDriverLabel(explanation: ScoreExplanation) {
  const label = [explanation.metricName, explanation.metricCode, explanation.domainCode].find(
    (value) => value !== null && value.trim().length > 0
  );

  if (!label) {
    return "Control Score driver";
  }

  return titleCase(label.trim().replaceAll("_", " "));
}

function buildAlertTitle(explanation: ScoreExplanation) {
  const label = buildDriverLabel(explanation);
  return `${titleCase(explanation.severity)} alert: ${label}`;
}

function readDomainAlertMetadata(domainScore: DomainScoreSnapshot) {
  const alertMetadata = getMetadataObject(domainScore.metadata.alert);
  const severityValue =
    getMetadataString(alertMetadata?.severity) ?? getMetadataString(domainScore.metadata.alertSeverity);
  const message =
    getMetadataString(alertMetadata?.message) ?? getMetadataString(domainScore.metadata.alertMessage);

  if (!severityValue || !message) {
    return null;
  }

  const title =
    getMetadataString(alertMetadata?.title) ??
    getMetadataString(domainScore.metadata.alertTitle) ??
    `${titleCase(severityValue)} alert: ${domainScore.domainName}`;

  return {
    severity: ScoreExplanation.severityFrom(severityValue),
    title,
    message,
    metricCode: getMetadataString(alertMetadata?.metricCode) ?? null
  };
}

function getMetadataObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getMetadataString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}
