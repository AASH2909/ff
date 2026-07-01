import { DomainError } from "@/domain/errors";
import type { DashboardAlertSeverity } from "@/dashboard/domain/entities/dashboard-severity";
import type { ScoreExplanationDriverType } from "@/dashboard/domain/entities/score-explanation";

export type DashboardInsightProps = {
  id: string;
  tenantId: string;
  controlScoreId: string;
  type: ScoreExplanationDriverType;
  severity: DashboardAlertSeverity;
  title: string;
  description: string;
  contribution: number;
  domainCode: string | null;
  metricCode: string | null;
  generatedAt: Date;
};

export class DashboardInsight {
  private readonly props: DashboardInsightProps;

  constructor(props: DashboardInsightProps) {
    if (!props.id.trim()) {
      throw new DomainError("Dashboard insight id is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Tenant id is required.");
    }

    if (!props.controlScoreId.trim()) {
      throw new DomainError("Control score id is required.");
    }

    if (!props.title.trim()) {
      throw new DomainError("Dashboard insight title is required.");
    }

    if (!props.description.trim()) {
      throw new DomainError("Dashboard insight description is required.");
    }

    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get controlScoreId() {
    return this.props.controlScoreId;
  }

  get type() {
    return this.props.type;
  }

  get severity() {
    return this.props.severity;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get contribution() {
    return this.props.contribution;
  }

  get domainCode() {
    return this.props.domainCode;
  }

  get metricCode() {
    return this.props.metricCode;
  }

  get generatedAt() {
    return this.props.generatedAt;
  }

  toSnapshot() {
    return {
      ...this.props
    };
  }
}
