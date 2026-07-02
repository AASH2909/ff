import { DomainError } from "@/domain/errors";
import type {
  TimelineSeverity,
  TimelineSource,
  TimelineType
} from "@/timeline/domain/value-objects";

export type TimelineMetadataValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[];

export type TimelineMetadata = Record<string, TimelineMetadataValue>;

export type TimelineEntryProps = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  occurredAt: Date;
  eventType: string;
  timelineType: TimelineType;
  title: string;
  summary: string;
  severity: TimelineSeverity;
  source: TimelineSource;
  metadata?: TimelineMetadata;
};

export class TimelineEntry {
  private readonly props: TimelineEntryProps;

  constructor(props: TimelineEntryProps) {
    validateRequiredText(props.id, "Timeline entry id is required.");
    validateRequiredText(props.tenantId, "Timeline entry tenant id is required.");
    validateRequiredText(props.eventType, "Timeline entry event type is required.");
    validateRequiredText(props.title, "Timeline entry title is required.");
    validateRequiredText(props.summary, "Timeline entry summary is required.");

    this.props = {
      ...props,
      metadata: props.metadata ?? {}
    };
  }

  get id() {
    return this.props.id;
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get businessUnitId() {
    return this.props.businessUnitId;
  }

  get occurredAt() {
    return this.props.occurredAt;
  }

  get eventType() {
    return this.props.eventType;
  }

  get timelineType() {
    return this.props.timelineType;
  }

  get title() {
    return this.props.title;
  }

  get summary() {
    return this.props.summary;
  }

  get severity() {
    return this.props.severity;
  }

  get source() {
    return this.props.source;
  }

  get metadata() {
    return { ...(this.props.metadata ?? {}) };
  }

  toSnapshot() {
    return {
      ...this.props,
      metadata: this.metadata
    };
  }
}

function validateRequiredText(value: string, message: string) {
  if (!value.trim()) {
    throw new DomainError(message);
  }
}
