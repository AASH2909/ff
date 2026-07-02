import { DomainError } from "@/domain/errors";
import type {
  NotificationChannel,
  NotificationLifecycleStatus,
  NotificationPriority
} from "@/notification/domain/value-objects";

export type NotificationMetadataValue = string | number | boolean | null | string[] | number[];
export type NotificationMetadata = Record<string, NotificationMetadataValue>;

export type NotificationRecipientType = "EXECUTIVE" | "OPERATIONS" | "CONTROL_CENTER";

export type NotificationProps = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  incidentId: string;
  recipientType: NotificationRecipientType;
  channel: NotificationChannel;
  status: NotificationLifecycleStatus;
  priority: NotificationPriority;
  createdAt: Date;
  sentAt: Date | null;
  acknowledgedAt: Date | null;
  metadata?: NotificationMetadata;
};

export class Notification {
  private readonly props: NotificationProps;

  constructor(props: NotificationProps) {
    if (!props.id.trim()) {
      throw new DomainError("Notification id is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Notification tenant id is required.");
    }

    if (!props.incidentId.trim()) {
      throw new DomainError("Notification incident id is required.");
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

  get incidentId() {
    return this.props.incidentId;
  }

  get recipientType() {
    return this.props.recipientType;
  }

  get channel() {
    return this.props.channel;
  }

  get status() {
    return this.props.status;
  }

  get priority() {
    return this.props.priority;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get sentAt() {
    return this.props.sentAt;
  }

  get acknowledgedAt() {
    return this.props.acknowledgedAt;
  }

  get metadata() {
    return { ...(this.props.metadata ?? {}) };
  }

  acknowledge(at: Date) {
    return new Notification({
      ...this.props,
      status: "ACKNOWLEDGED",
      acknowledgedAt: at
    });
  }

  resolve() {
    return new Notification({
      ...this.props,
      status: "RESOLVED"
    });
  }

  toSnapshot() {
    return {
      ...this.props,
      metadata: this.metadata
    };
  }
}
