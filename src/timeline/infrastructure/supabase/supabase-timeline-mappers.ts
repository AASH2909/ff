import {
  TimelineEntry,
  TimelineGraph,
  TimelineLink,
  normalizeTimelineRelationType,
  normalizeTimelineSeverity,
  normalizeTimelineSource,
  normalizeTimelineType,
  type TimelineMetadata
} from "@/timeline/domain";
import type { Database, Json } from "@/types/database";

export type TimelineEntryRow = Database["public"]["Tables"]["timeline_entries"]["Row"];
export type TimelineEntryInsert =
  Database["public"]["Tables"]["timeline_entries"]["Insert"];
export type TimelineLinkRow = Database["public"]["Tables"]["timeline_links"]["Row"];
export type TimelineLinkInsert = Database["public"]["Tables"]["timeline_links"]["Insert"];

export function mapTimelineEntryRow(row: TimelineEntryRow) {
  return new TimelineEntry({
    id: row.id,
    tenantId: row.tenant_id,
    businessUnitId: row.business_unit_id,
    occurredAt: new Date(row.occurred_at),
    eventType: row.event_type,
    timelineType: normalizeTimelineType(row.timeline_type),
    title: row.title,
    summary: row.summary,
    severity: normalizeTimelineSeverity(row.severity),
    source: normalizeTimelineSource(row.source),
    metadata: jsonToTimelineMetadata(row.metadata)
  });
}

export function mapTimelineEntryInsert(
  graph: TimelineGraph,
  entry: TimelineEntry
): TimelineEntryInsert {
  const now = graph.generatedAt.toISOString();

  return {
    id: entry.id,
    tenant_id: entry.tenantId,
    business_unit_id: entry.businessUnitId,
    occurred_at: entry.occurredAt.toISOString(),
    event_type: entry.eventType,
    timeline_type: entry.timelineType,
    title: entry.title,
    summary: entry.summary,
    severity: entry.severity,
    source: entry.source,
    metadata: entry.metadata,
    created_at: now,
    updated_at: now
  };
}

export function mapTimelineLinkRow(row: TimelineLinkRow) {
  return new TimelineLink({
    sourceEntryId: row.source_entry_id,
    targetEntryId: row.target_entry_id,
    relationType: normalizeTimelineRelationType(row.relation_type),
    confidence: row.confidence
  });
}

export function mapTimelineLinkInsert(
  graph: TimelineGraph,
  link: TimelineLink
): TimelineLinkInsert {
  return {
    tenant_id: graph.tenantId,
    business_unit_id: graph.businessUnitId,
    source_entry_id: link.sourceEntryId,
    target_entry_id: link.targetEntryId,
    relation_type: link.relationType,
    confidence: link.confidence,
    created_at: graph.generatedAt.toISOString()
  };
}

function jsonToTimelineMetadata(value: Json): TimelineMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<TimelineMetadata>((metadata, [key, item]) => {
    if (item !== undefined && isTimelineMetadataValue(item)) {
      metadata[key] = item;
    }

    return metadata;
  }, {});
}

function isTimelineMetadataValue(value: Json): value is TimelineMetadata[string] {
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
