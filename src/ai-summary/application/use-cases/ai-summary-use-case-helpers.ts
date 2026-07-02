import type { ApplicationError } from "@/application/result";
import type {
  ApplicationEvent,
  ApplicationEventPublisher
} from "@/application/ports/application-event-publisher";
import { noopApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { IdGenerator } from "@/application/ports/id-generator";
import type { ExecutiveSummary, ExecutiveSummaryType } from "@/ai-summary/domain";

export type AISummaryUseCaseCommonDependencies = {
  clock?: Clock;
  idGenerator?: IdGenerator;
  eventPublisher?: ApplicationEventPublisher;
};

export function getClock(dependencies: AISummaryUseCaseCommonDependencies) {
  return dependencies.clock ?? systemClock;
}

export function getIdGenerator(dependencies: AISummaryUseCaseCommonDependencies) {
  return dependencies.idGenerator ?? systemIdGenerator;
}

export function getEventPublisher(dependencies: AISummaryUseCaseCommonDependencies) {
  return dependencies.eventPublisher ?? noopApplicationEventPublisher;
}

export function mapUnexpectedAISummaryError(error: unknown): ApplicationError {
  void error;

  return {
    code: "PERSISTENCE_ERROR",
    message: "Unable to process AI executive summary data."
  };
}

export function buildAISummaryGeneratedEvent(
  summary: ExecutiveSummary
): ApplicationEvent<"AISummaryGenerated"> {
  return {
    eventName: "AISummaryGenerated",
    tenantId: summary.tenantId,
    aggregateId: summary.id,
    occurredAt: summary.generatedAt.toISOString(),
    payload: {
      summaryId: summary.id,
      tenantId: summary.tenantId,
      sourceId: String(summary.metadata.controlScoreId ?? summary.id),
      summaryType: toEventSummaryType(summary.summaryType),
      summary: summary.headline,
      generatedAt: summary.generatedAt.toISOString()
    }
  };
}

function toEventSummaryType(summaryType: ExecutiveSummaryType) {
  return summaryType.toLowerCase() as Lowercase<ExecutiveSummaryType>;
}

const systemIdGenerator: IdGenerator = {
  nextId: () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};
