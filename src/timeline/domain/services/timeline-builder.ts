import type { AnalyticsContextDto } from "@/analytics-context/application";
import type { PredictionDto } from "@/predictive/application";
import {
  TimelineEntry,
  TimelineGraph,
  TimelineLink,
  type TimelineEntryProps,
  type TimelineMetadata
} from "@/timeline/domain/entities";
import type {
  TimelineRelationType,
  TimelineSeverity,
  TimelineType
} from "@/timeline/domain/value-objects";

export type TimelineBuilderInput = {
  context: AnalyticsContextDto;
  predictions: PredictionDto[];
  generatedAt: Date;
  limit: number;
};

type EntryDraft = Omit<TimelineEntryProps, "tenantId" | "businessUnitId">;

type LinkDraft = {
  sourceEntryId: string;
  targetEntryId: string;
  relationType: TimelineRelationType;
  confidence: number;
};

type BuiltEntries = {
  scoreEntry: TimelineEntry | null;
  causeEntries: TimelineEntry[];
  recommendationEntries: TimelineEntry[];
  predictionEntries: TimelineEntry[];
};

export class TimelineBuilder {
  build(input: TimelineBuilderInput): TimelineGraph {
    const scope = {
      tenantId: input.context.tenantId,
      businessUnitId: input.context.businessUnitId
    };
    const entries = this.buildEntries(input).map(
      (draft) =>
        new TimelineEntry({
          ...draft,
          ...scope
        })
    );
    const built = partitionEntries(entries);
    const links = this.buildLinks(built, input.predictions);

    return new TimelineGraph({
      ...scope,
      generatedAt: input.generatedAt,
      entries: entries.slice(0, input.limit),
      links
    });
  }

  private buildEntries(input: TimelineBuilderInput): EntryDraft[] {
    return dedupeEntryDrafts([
      ...this.buildControlScoreEntries(input.context),
      ...this.buildDomainSignalEntries(input.context),
      ...this.buildDriverEntries(input.context),
      ...this.buildIncidentEntries(input.context),
      ...this.buildFraudEntries(input.context),
      ...this.buildRecommendationEntries(input.context),
      ...this.buildPredictionEntries(input)
    ]).sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());
  }

  private buildControlScoreEntries(context: AnalyticsContextDto): EntryDraft[] {
    const score = context.controlScore;

    if (!score) {
      return [];
    }

    return [
      {
        id: buildEntryId(context, "control_score", score.id),
        occurredAt: new Date(score.calculatedAt),
        eventType: "CONTROL_SCORE_STATE",
        timelineType: "EFFECT",
        title: `Control Score ${score.score}`,
        summary:
          score.scoreChange === null
            ? `Current Control Score is ${score.score}.`
            : `Control Score moved by ${score.scoreChange} point(s) to ${score.score}.`,
        severity: severityFromScore(score.score, score.scoreChange),
        source: "ANALYTICS_CONTEXT",
        metadata: {
          sourceControlScoreId: score.id,
          score: score.score,
          previousScore: score.previousScore,
          scoreChange: score.scoreChange,
          status: score.status
        }
      }
    ];
  }

  private buildDomainSignalEntries(context: AnalyticsContextDto): EntryDraft[] {
    const domains = context.dashboardOverview?.domainScores ?? [];

    return domains
      .filter((domain) => domain.score < 75 || (domain.scoreChange ?? 0) < 0)
      .slice(0, 8)
      .map((domain) => ({
        id: buildEntryId(context, "domain", `${domain.domainCode}:${domain.ranking}`),
        occurredAt: new Date(context.dashboardOverview?.lastCalculationTime ?? context.generatedAt),
        eventType: "DOMAIN_SCORE_SIGNAL",
        timelineType: "CAUSE" as TimelineType,
        title: `${domain.domainName} pressure`,
        summary:
          domain.scoreChange === null
            ? `${domain.domainName} is contributing ${domain.contribution} points at score ${domain.score}.`
            : `${domain.domainName} changed by ${domain.scoreChange} point(s) and contributes ${domain.contribution}.`,
        severity: severityFromScore(domain.score, domain.scoreChange),
        source: "ANALYTICS_CONTEXT" as const,
        metadata: {
          domainCode: domain.domainCode,
          domainName: domain.domainName,
          score: domain.score,
          contribution: domain.contribution,
          scoreChange: domain.scoreChange,
          ranking: domain.ranking
        }
      }));
  }

  private buildDriverEntries(context: AnalyticsContextDto): EntryDraft[] {
    const drivers = context.dashboardOverview?.topNegativeDrivers ?? [];

    return drivers.slice(0, 8).map((driver) => ({
      id: buildEntryId(context, "driver", driver.id),
      occurredAt: new Date(driver.generatedAt),
      eventType: "NEGATIVE_DRIVER",
      timelineType: "CAUSE" as TimelineType,
      title: driver.title,
      summary: driver.description,
      severity: severityFromExternal(driver.severity),
      source: "ANALYTICS_CONTEXT" as const,
      metadata: {
        sourceDriverId: driver.id,
        driverType: driver.type,
        contribution: driver.contribution,
        domainCode: driver.domainCode,
        metricCode: driver.metricCode
      }
    }));
  }

  private buildIncidentEntries(context: AnalyticsContextDto): EntryDraft[] {
    return context.incidents
      .filter((incident) => incident.status !== "RESOLVED")
      .slice(0, 10)
      .map((incident) => ({
        id: buildEntryId(context, "incident", incident.id),
        occurredAt: new Date(incident.createdAt),
        eventType: "INCIDENT_SIGNAL",
        timelineType: "FACT" as TimelineType,
        title: incident.title,
        summary: incident.description,
        severity: severityFromExternal(incident.severity),
        source: "ANALYTICS_CONTEXT" as const,
        metadata: {
          sourceIncidentId: incident.id,
          category: incident.category,
          status: incident.status,
          sourceEvent: incident.sourceEvent,
          sourceEventId: incident.sourceEventId
        }
      }));
  }

  private buildFraudEntries(context: AnalyticsContextDto): EntryDraft[] {
    if (
      context.fraudInsights.totalIncidents === 0 &&
      context.fraudInsights.recentIncidents.length === 0
    ) {
      return [];
    }

    return [
      {
        id: buildEntryId(context, "fraud", "fraud-insights"),
        occurredAt: newestDate(
          context.fraudInsights.recentIncidents.map((incident) => incident.detectedAt),
          context.generatedAt
        ),
        eventType: "FRAUD_SIGNAL",
        timelineType: "CAUSE",
        title: "Fraud risk signal",
        summary: `${context.fraudInsights.totalIncidents} fraud incident(s), ${context.fraudInsights.criticalCount} critical, average risk score ${context.fraudInsights.averageRiskScore}.`,
        severity:
          context.fraudInsights.criticalCount > 0 || context.fraudInsights.averageRiskScore >= 700
            ? "CRITICAL"
            : "WARNING",
        source: "ANALYTICS_CONTEXT",
        metadata: {
          totalIncidents: context.fraudInsights.totalIncidents,
          criticalCount: context.fraudInsights.criticalCount,
          averageRiskScore: context.fraudInsights.averageRiskScore,
          recentIncidentIds: context.fraudInsights.recentIncidents
            .slice(0, 5)
            .map((incident) => incident.id)
        }
      }
    ];
  }

  private buildRecommendationEntries(context: AnalyticsContextDto): EntryDraft[] {
    return context.recommendations.slice(0, 10).map((recommendation) => ({
      id: buildEntryId(context, "recommendation", recommendation.id),
      occurredAt: new Date(recommendation.createdAt),
      eventType: "EXECUTIVE_RECOMMENDATION",
      timelineType: "RECOMMENDATION" as TimelineType,
      title: recommendation.title,
      summary: recommendation.recommendedAction,
      severity: severityFromPriority(recommendation.priority),
      source: "ANALYTICS_CONTEXT" as const,
      metadata: {
        sourceRecommendationId: recommendation.id,
        priority: recommendation.priority,
        category: recommendation.category,
        confidence: recommendation.confidence,
        source: recommendation.source
      }
    }));
  }

  private buildPredictionEntries(input: TimelineBuilderInput): EntryDraft[] {
    return input.predictions.slice(0, 10).map((prediction) => ({
      id: buildEntryId(input.context, "prediction", prediction.id),
      occurredAt: new Date(prediction.createdAt),
      eventType: "PREDICTION_SIGNAL",
      timelineType: "PREDICTION" as TimelineType,
      title: titleCase(prediction.predictionType),
      summary: prediction.summary,
      severity: severityFromRiskLevel(prediction.riskLevel),
      source: "PREDICTIVE" as const,
      metadata: {
        sourcePredictionId: prediction.id,
        predictionType: prediction.predictionType,
        predictionWindow: prediction.predictionWindow,
        riskLevel: prediction.riskLevel,
        trend: prediction.trend,
        confidence: prediction.confidence,
        factorTypes: prediction.factors.map((factor) => factor.factorType).slice(0, 8)
      }
    }));
  }

  private buildLinks(entries: BuiltEntries, predictions: PredictionDto[]): TimelineLink[] {
    const drafts: LinkDraft[] = [];

    entries.causeEntries.forEach((cause) => {
      if (entries.scoreEntry) {
        drafts.push(link(cause.id, entries.scoreEntry.id, "CAUSES", confidenceFromSeverity(cause.severity)));
      }

      entries.recommendationEntries
        .filter((recommendation) => entriesRelate(cause, recommendation))
        .forEach((recommendation) => {
          drafts.push(link(cause.id, recommendation.id, "SUPPORTS", 72));
        });
    });

    const scoreEntry = entries.scoreEntry;

    if (scoreEntry) {
      entries.recommendationEntries.forEach((recommendation) => {
        drafts.push(link(scoreEntry.id, recommendation.id, "RESULTS_IN", 68));
      });

      entries.predictionEntries.forEach((prediction) => {
        drafts.push(
          link(
            scoreEntry.id,
            prediction.id,
            prediction.metadata.predictionType === "CONTROL_SCORE" ? "PREDICTS" : "SUPPORTS",
            76
          )
        );
      });
    }

    entries.recommendationEntries.forEach((recommendation) => {
      entries.predictionEntries
        .filter((prediction) => predictionRelatesToRecommendation(prediction, recommendation, predictions))
        .forEach((prediction) => {
          drafts.push(link(recommendation.id, prediction.id, "SUPPORTS", 82));
        });
    });

    entries.predictionEntries.forEach((prediction) => {
      entries.causeEntries
        .filter((cause) => entriesRelate(cause, prediction))
        .forEach((cause) => {
          drafts.push(link(cause.id, prediction.id, "PREDICTS", 78));
        });
    });

    return dedupeLinkDrafts(drafts).map((draft) => new TimelineLink(draft));
  }
}

function partitionEntries(entries: TimelineEntry[]): BuiltEntries {
  return {
    scoreEntry: entries.find((entry) => entry.eventType === "CONTROL_SCORE_STATE") ?? null,
    causeEntries: entries.filter(
      (entry) => entry.timelineType === "CAUSE" || entry.timelineType === "FACT"
    ),
    recommendationEntries: entries.filter((entry) => entry.timelineType === "RECOMMENDATION"),
    predictionEntries: entries.filter((entry) => entry.timelineType === "PREDICTION")
  };
}

function link(
  sourceEntryId: string,
  targetEntryId: string,
  relationType: TimelineRelationType,
  confidence: number
): LinkDraft {
  return {
    sourceEntryId,
    targetEntryId,
    relationType,
    confidence
  };
}

function predictionRelatesToRecommendation(
  prediction: TimelineEntry,
  recommendation: TimelineEntry,
  predictions: PredictionDto[]
) {
  const sourcePredictionId = readStringMetadata(prediction.metadata, "sourcePredictionId");
  const sourceRecommendationId = readStringMetadata(recommendation.metadata, "sourceRecommendationId");
  const sourcePrediction = predictions.find((candidate) => candidate.id === sourcePredictionId);

  if (!sourcePrediction || !sourceRecommendationId) {
    return entriesRelate(prediction, recommendation);
  }

  return (
    sourcePrediction.factors.some((factor) => factor.evidence.includes(sourceRecommendationId)) ||
    entriesRelate(prediction, recommendation)
  );
}

function entriesRelate(left: TimelineEntry, right: TimelineEntry) {
  const leftText = searchableText(left);
  const rightText = searchableText(right);
  const leftTokens = importantTokens(leftText);

  return leftTokens.some((token) => rightText.includes(token));
}

function searchableText(entry: TimelineEntry) {
  return [
    entry.eventType,
    entry.title,
    entry.summary,
    ...Object.values(entry.metadata)
      .filter((value): value is string | string[] => typeof value === "string" || isStringArray(value))
      .flat()
  ]
    .join(" ")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLowerCase();
}

function importantTokens(value: string) {
  const ignored = new Set([
    "the",
    "and",
    "with",
    "from",
    "score",
    "risk",
    "signal",
    "control",
    "recommendation"
  ]);

  return value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 5 && !ignored.has(token))
    .slice(0, 12);
}

function buildEntryId(context: AnalyticsContextDto, kind: string, sourceId: string) {
  const scope = context.businessUnitId ?? "tenant";
  return ["timeline", context.tenantId, scope, kind, sourceId].map(slug).join(":");
}

function dedupeEntryDrafts(entries: EntryDraft[]) {
  const byId = new Map<string, EntryDraft>();

  entries.forEach((entry) => {
    const existing = byId.get(entry.id);

    if (!existing || entry.occurredAt > existing.occurredAt) {
      byId.set(entry.id, entry);
    }
  });

  return [...byId.values()];
}

function dedupeLinkDrafts(links: LinkDraft[]) {
  const byKey = new Map<string, LinkDraft>();

  links.forEach((item) => {
    const key = `${item.sourceEntryId}:${item.targetEntryId}:${item.relationType}`;
    const existing = byKey.get(key);

    if (!existing || item.confidence > existing.confidence) {
      byKey.set(key, item);
    }
  });

  return [...byKey.values()];
}

function severityFromExternal(value: string): TimelineSeverity {
  const normalized = value.trim().toUpperCase();

  if (normalized === "SEVERE") {
    return "SEVERE";
  }

  if (normalized === "CRITICAL") {
    return "CRITICAL";
  }

  if (normalized === "WARNING") {
    return "WARNING";
  }

  return "INFO";
}

function severityFromPriority(value: string): TimelineSeverity {
  if (value === "CRITICAL") {
    return "SEVERE";
  }

  if (value === "HIGH") {
    return "CRITICAL";
  }

  if (value === "MEDIUM") {
    return "WARNING";
  }

  return "INFO";
}

function severityFromRiskLevel(value: string): TimelineSeverity {
  if (value === "CRITICAL") {
    return "SEVERE";
  }

  if (value === "HIGH") {
    return "CRITICAL";
  }

  if (value === "MEDIUM") {
    return "WARNING";
  }

  return "INFO";
}

function severityFromScore(score: number, scoreChange: number | null): TimelineSeverity {
  if (score < 50 || (scoreChange !== null && scoreChange <= -10)) {
    return "SEVERE";
  }

  if (score < 65 || (scoreChange !== null && scoreChange <= -5)) {
    return "CRITICAL";
  }

  if (score < 80 || (scoreChange !== null && scoreChange < 0)) {
    return "WARNING";
  }

  return "INFO";
}

function confidenceFromSeverity(severity: TimelineSeverity) {
  const confidenceBySeverity: Record<TimelineSeverity, number> = {
    INFO: 58,
    WARNING: 68,
    CRITICAL: 82,
    SEVERE: 90
  };

  return confidenceBySeverity[severity];
}

function newestDate(values: string[], fallback: string) {
  const timestamps = values
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) {
    return new Date(fallback);
  }

  return new Date(Math.max(...timestamps));
}

function readStringMetadata(metadata: TimelineMetadata, key: string) {
  const value = metadata[key];

  return typeof value === "string" ? value : null;
}

function isStringArray(value: TimelineMetadata[string]): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slug(value: string) {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  return normalized.length > 0 ? normalized : "UNKNOWN";
}
