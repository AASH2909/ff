import type {
  TimelineEntry,
  TimelineGraph,
  TimelineLink,
  TimelineMetadata,
  TimelineRelationType,
  TimelineSeverity,
  TimelineSource,
  TimelineType
} from "@/timeline/domain";

export type TimelineScopeDto = {
  tenantId: string;
  businessUnitId?: string;
};

export type TimelineQueryDto = TimelineScopeDto & {
  limit?: number;
};

export type TimelineByIdQueryDto = TimelineScopeDto & {
  id: string;
};

export type TimelineEntryDto = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  occurredAt: string;
  eventType: string;
  timelineType: TimelineType;
  title: string;
  summary: string;
  severity: TimelineSeverity;
  source: TimelineSource;
  metadata: TimelineMetadata;
};

export type TimelineLinkDto = {
  sourceEntryId: string;
  targetEntryId: string;
  relationType: TimelineRelationType;
  confidence: number;
};

export type TimelineGraphDto = {
  tenantId: string;
  businessUnitId: string | null;
  generatedAt: string;
  entries: TimelineEntryDto[];
  links: TimelineLinkDto[];
};

export type TimelineOutputDto = {
  graph: TimelineGraphDto;
};

export type TimelineEntryOutputDto = {
  entry: TimelineEntryDto;
};

export function toTimelineEntryDto(entry: TimelineEntry): TimelineEntryDto {
  return {
    id: entry.id,
    tenantId: entry.tenantId,
    businessUnitId: entry.businessUnitId,
    occurredAt: entry.occurredAt.toISOString(),
    eventType: entry.eventType,
    timelineType: entry.timelineType,
    title: entry.title,
    summary: entry.summary,
    severity: entry.severity,
    source: entry.source,
    metadata: entry.metadata
  };
}

export function toTimelineLinkDto(link: TimelineLink): TimelineLinkDto {
  return {
    sourceEntryId: link.sourceEntryId,
    targetEntryId: link.targetEntryId,
    relationType: link.relationType,
    confidence: link.confidence
  };
}

export function toTimelineGraphDto(graph: TimelineGraph): TimelineGraphDto {
  return {
    tenantId: graph.tenantId,
    businessUnitId: graph.businessUnitId,
    generatedAt: graph.generatedAt.toISOString(),
    entries: graph.entries.map(toTimelineEntryDto),
    links: graph.links.map(toTimelineLinkDto)
  };
}
