import { DomainError } from "@/domain/errors";
import type { DashboardAlertSeverity } from "@/dashboard/domain/entities/dashboard-severity";

export type DashboardAlertSource = "control_score" | "dashboard" | "fraud" | "audit" | "operations";
export type DashboardAlertStatus = "active" | "acknowledged" | "resolved";

export type DashboardAlertProps = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  severity: DashboardAlertSeverity;
  status: DashboardAlertStatus;
  title: string;
  message: string;
  source: DashboardAlertSource;
  domainCode: string | null;
  metricCode: string | null;
  resourceType: string | null;
  resourceId: string | null;
  occurredAt: Date;
};

export class DashboardAlert {
  private readonly props: DashboardAlertProps;

  constructor(props: DashboardAlertProps) {
    if (!props.id.trim()) {
      throw new DomainError("Dashboard alert id is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Tenant id is required.");
    }

    if (!props.title.trim()) {
      throw new DomainError("Dashboard alert title is required.");
    }

    if (!props.message.trim()) {
      throw new DomainError("Dashboard alert message is required.");
    }

    this.props = props;
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

  get message() {
    return this.props.message;
  }

  get source() {
    return this.props.source;
  }

  get domainCode() {
    return this.props.domainCode;
  }

  get metricCode() {
    return this.props.metricCode;
  }

  get resourceType() {
    return this.props.resourceType;
  }

  get resourceId() {
    return this.props.resourceId;
  }

  get occurredAt() {
    return this.props.occurredAt;
  }

  toSnapshot() {
    return {
      ...this.props
    };
  }
}
