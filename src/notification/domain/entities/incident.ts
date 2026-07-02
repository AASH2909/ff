import { DomainError } from "@/domain/errors";
import type {
  IncidentSeverity,
  NotificationLifecycleStatus
} from "@/notification/domain/value-objects";

export type IncidentMetadataValue = string | number | boolean | null | string[] | number[];
export type IncidentMetadata = Record<string, IncidentMetadataValue>;

export type IncidentProps = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  severity: IncidentSeverity;
  status: NotificationLifecycleStatus;
  title: string;
  description: string;
  sourceEvent: string;
  sourceEventId: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  metadata?: IncidentMetadata;
};

export class Incident {
  private readonly props: IncidentProps;

  constructor(props: IncidentProps) {
    if (!props.id.trim()) {
      throw new DomainError("Incident id is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Incident tenant id is required.");
    }

    if (!props.title.trim()) {
      throw new DomainError("Incident title is required.");
    }

    if (!props.description.trim()) {
      throw new DomainError("Incident description is required.");
    }

    if (!props.sourceEvent.trim()) {
      throw new DomainError("Incident source event is required.");
    }

    if (!props.sourceEventId.trim()) {
      throw new DomainError("Incident source event id is required.");
    }

    if (!props.category.trim()) {
      throw new DomainError("Incident category is required.");
    }

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

  get severity() {
    return this.props.severity;
  }

  get status() {
    return this.props.status;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get sourceEvent() {
    return this.props.sourceEvent;
  }

  get sourceEventId() {
    return this.props.sourceEventId;
  }

  get category() {
    return this.props.category;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get resolvedAt() {
    return this.props.resolvedAt;
  }

  get metadata() {
    return { ...(this.props.metadata ?? {}) };
  }

  acknowledge(at: Date) {
    return new Incident({
      ...this.props,
      status: "ACKNOWLEDGED",
      updatedAt: at
    });
  }

  resolve(at: Date) {
    return new Incident({
      ...this.props,
      status: "RESOLVED",
      updatedAt: at,
      resolvedAt: at
    });
  }

  toSnapshot() {
    return {
      ...this.props,
      metadata: this.metadata
    };
  }
}
