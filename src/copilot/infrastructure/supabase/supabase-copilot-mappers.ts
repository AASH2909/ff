import {
  CopilotContextSnapshot,
  CopilotMessage,
  CopilotSession,
  normalizeCopilotIntent,
  normalizeCopilotMessageRole,
  normalizeCopilotSessionStatus,
  type CopilotMetadata
} from "@/copilot/domain";
import type { AnalyticsContextDto } from "@/analytics-context/application";
import type { PredictionDto } from "@/predictive/application";
import type { TimelineEntryDto } from "@/timeline/application";
import type { DecisionScenarioDto } from "@/decision/application";
import type { Database, Json } from "@/types/database";

export type CopilotSessionRow = Database["public"]["Tables"]["copilot_sessions"]["Row"];
export type CopilotSessionInsert =
  Database["public"]["Tables"]["copilot_sessions"]["Insert"];
export type CopilotMessageRow = Database["public"]["Tables"]["copilot_messages"]["Row"];
export type CopilotMessageInsert =
  Database["public"]["Tables"]["copilot_messages"]["Insert"];
export type CopilotContextSnapshotRow =
  Database["public"]["Tables"]["copilot_context_snapshots"]["Row"];
export type CopilotContextSnapshotInsert =
  Database["public"]["Tables"]["copilot_context_snapshots"]["Insert"];

export function mapCopilotSessionRow(row: CopilotSessionRow) {
  return new CopilotSession({
    id: row.id,
    tenantId: row.tenant_id,
    businessUnitId: row.business_unit_id,
    status: normalizeCopilotSessionStatus(row.status),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    metadata: jsonToCopilotMetadata(row.metadata)
  });
}

export function mapCopilotSessionInsert(session: CopilotSession): CopilotSessionInsert {
  return {
    id: session.id,
    tenant_id: session.tenantId,
    business_unit_id: session.businessUnitId,
    status: session.status,
    created_at: session.createdAt.toISOString(),
    updated_at: session.updatedAt.toISOString(),
    metadata: session.metadata as Json
  };
}

export function mapCopilotMessageRow(row: CopilotMessageRow) {
  return new CopilotMessage({
    id: row.id,
    sessionId: row.session_id,
    role: normalizeCopilotMessageRole(row.role),
    content: row.content,
    intent: normalizeCopilotIntent(row.intent),
    createdAt: new Date(row.created_at),
    metadata: jsonToCopilotMetadata(row.metadata)
  });
}

export function mapCopilotMessageInsert(message: CopilotMessage): CopilotMessageInsert {
  return {
    id: message.id,
    session_id: message.sessionId,
    role: message.role,
    content: message.content,
    intent: message.intent,
    created_at: message.createdAt.toISOString(),
    metadata: message.metadata as Json
  };
}

export function mapCopilotContextSnapshotRow(row: CopilotContextSnapshotRow) {
  return new CopilotContextSnapshot({
    id: row.id,
    sessionId: row.session_id,
    analyticsContext: jsonToAnalyticsContext(row.analytics_context),
    predictions: jsonToPredictionDtos(row.predictions),
    timeline: jsonToTimelineEntryDtos(row.timeline),
    decisionScenarios: jsonToDecisionScenarioDtos(row.decision_scenarios),
    createdAt: new Date(row.created_at),
    metadata: jsonToCopilotMetadata(row.metadata)
  });
}

export function mapCopilotContextSnapshotInsert(
  contextSnapshot: CopilotContextSnapshot
): CopilotContextSnapshotInsert {
  return {
    id: contextSnapshot.id,
    session_id: contextSnapshot.sessionId,
    analytics_context: contextSnapshot.analyticsContext as unknown as Json,
    predictions: contextSnapshot.predictions as unknown as Json,
    timeline: contextSnapshot.timeline as unknown as Json,
    decision_scenarios: contextSnapshot.decisionScenarios as unknown as Json,
    created_at: contextSnapshot.createdAt.toISOString(),
    metadata: contextSnapshot.metadata as Json
  };
}

function jsonToCopilotMetadata(value: Json): CopilotMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<CopilotMetadata>((metadata, [key, item]) => {
    if (item !== undefined && isCopilotMetadataValue(item)) {
      metadata[key] = item;
    }

    return metadata;
  }, {});
}

function isCopilotMetadataValue(value: Json): value is CopilotMetadata[string] {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" || typeof item === "number")
  );
}

function jsonToAnalyticsContext(value: Json): AnalyticsContextDto | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as unknown as AnalyticsContextDto;
}

function jsonToPredictionDtos(value: Json): PredictionDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as unknown as PredictionDto[];
}

function jsonToTimelineEntryDtos(value: Json): TimelineEntryDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as unknown as TimelineEntryDto[];
}

function jsonToDecisionScenarioDtos(value: Json): DecisionScenarioDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as unknown as DecisionScenarioDto[];
}
