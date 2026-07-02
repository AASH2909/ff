import type { DomainEvent, EventName } from "@/events";
import { Incident, type IncidentMetadata } from "@/notification/domain/entities";
import { normalizeIncidentSeverity, type IncidentSeverity } from "@/notification/domain/value-objects";

export type NotificationEventMappingInput = {
  event: DomainEvent<EventName>;
  incidentId: string;
  occurredAt: Date;
};

export class NotificationEventMapper {
  map(input: NotificationEventMappingInput): Incident {
    const { event } = input;

    if (event.eventName === "FraudDetected") {
      return this.mapFraudDetected(event as DomainEvent<"FraudDetected">, input);
    }

    if (event.eventName === "ControlScoreUpdated") {
      return this.mapControlScoreUpdated(event as DomainEvent<"ControlScoreUpdated">, input);
    }

    if (event.eventName === "AISummaryGenerated") {
      return this.mapAISummaryGenerated(event as DomainEvent<"AISummaryGenerated">, input);
    }

    return this.mapGenericEvent(event, input);
  }

  private mapFraudDetected(
    event: DomainEvent<"FraudDetected">,
    input: NotificationEventMappingInput
  ) {
    return new Incident({
      id: input.incidentId,
      tenantId: event.tenantId,
      businessUnitId: getBusinessUnitId(event),
      severity: severityFromFraud(event.payload.severity),
      status: "NEW",
      title: "Fraud incident detected",
      description: event.payload.description,
      sourceEvent: event.eventName,
      sourceEventId: event.eventId,
      category: "FRAUD",
      createdAt: input.occurredAt,
      updatedAt: input.occurredAt,
      resolvedAt: null,
      metadata: compactMetadata({
        aggregateId: event.aggregateId,
        incidentId: event.payload.incidentId,
        orderId: event.payload.orderId,
        employeeId: event.payload.employeeId,
        riskScore: event.payload.riskScore,
        detectedAt: event.payload.detectedAt,
        source: event.source ?? null
      })
    });
  }

  private mapControlScoreUpdated(
    event: DomainEvent<"ControlScoreUpdated">,
    input: NotificationEventMappingInput
  ) {
    return new Incident({
      id: input.incidentId,
      tenantId: event.tenantId,
      businessUnitId: getBusinessUnitId(event),
      severity: severityFromMetadata(event.metadata),
      status: "NEW",
      title: "Control Score updated",
      description: `Control Score ${event.payload.scoreType} ${event.payload.entityId} updated to ${event.payload.score}.`,
      sourceEvent: event.eventName,
      sourceEventId: event.eventId,
      category: "CONTROL_SCORE",
      createdAt: input.occurredAt,
      updatedAt: input.occurredAt,
      resolvedAt: null,
      metadata: compactMetadata({
        aggregateId: event.aggregateId,
        scoreId: event.payload.scoreId,
        entityId: event.payload.entityId,
        scoreType: event.payload.scoreType,
        score: event.payload.score,
        previousScore: event.payload.previousScore ?? null,
        updatedAt: event.payload.updatedAt,
        source: event.source ?? null
      })
    });
  }

  private mapAISummaryGenerated(
    event: DomainEvent<"AISummaryGenerated">,
    input: NotificationEventMappingInput
  ) {
    return new Incident({
      id: input.incidentId,
      tenantId: event.tenantId,
      businessUnitId: getBusinessUnitId(event),
      severity: severityFromMetadata(event.metadata),
      status: "NEW",
      title: "AI executive summary generated",
      description: event.payload.summary,
      sourceEvent: event.eventName,
      sourceEventId: event.eventId,
      category: "AI_SUMMARY",
      createdAt: input.occurredAt,
      updatedAt: input.occurredAt,
      resolvedAt: null,
      metadata: compactMetadata({
        aggregateId: event.aggregateId,
        summaryId: event.payload.summaryId,
        sourceId: event.payload.sourceId,
        summaryType: event.payload.summaryType,
        generatedAt: event.payload.generatedAt,
        source: event.source ?? null
      })
    });
  }

  private mapGenericEvent(event: DomainEvent<EventName>, input: NotificationEventMappingInput) {
    return new Incident({
      id: input.incidentId,
      tenantId: event.tenantId,
      businessUnitId: getBusinessUnitId(event),
      severity: severityFromMetadata(event.metadata),
      status: "NEW",
      title: `${event.eventName} event received`,
      description: `Operations event ${event.eventName} was received by Notification Center.`,
      sourceEvent: event.eventName,
      sourceEventId: event.eventId,
      category: "OPERATIONS",
      createdAt: input.occurredAt,
      updatedAt: input.occurredAt,
      resolvedAt: null,
      metadata: compactMetadata({
        aggregateId: event.aggregateId,
        source: event.source ?? null
      })
    });
  }
}

function severityFromFraud(value: string): IncidentSeverity {
  if (value === "critical") {
    return "severe";
  }

  return normalizeIncidentSeverity(value);
}

function severityFromMetadata(metadata: DomainEvent<EventName>["metadata"]): IncidentSeverity {
  const severity = metadata?.severity;

  if (typeof severity === "string") {
    return normalizeIncidentSeverity(severity);
  }

  return "information";
}

function getBusinessUnitId(event: DomainEvent<EventName>) {
  const value = event.metadata?.businessUnitId ?? event.metadata?.locationId;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function compactMetadata(values: Record<string, IncidentMetadata[string] | undefined>) {
  return Object.entries(values).reduce<IncidentMetadata>((metadata, [key, value]) => {
    if (value !== undefined) {
      metadata[key] = value;
    }

    return metadata;
  }, {});
}
