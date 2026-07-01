import { DomainError } from "@/domain/errors";
import {
  normalizeDashboardSeverity,
  type DashboardAlertSeverity
} from "@/dashboard/domain/entities/dashboard-severity";

export type ScoreExplanationDriverType = "positive" | "negative" | "risk" | "neutral";

export type ScoreExplanationProps = {
  id: string;
  tenantId: string;
  controlScoreId: string;
  domainCode: string | null;
  metricCode: string | null;
  metricName: string | null;
  driverType: ScoreExplanationDriverType;
  contribution: number;
  severity: DashboardAlertSeverity;
  explanation: string;
  createdAt: Date;
};

export class ScoreExplanation {
  private readonly props: ScoreExplanationProps;

  constructor(props: ScoreExplanationProps) {
    if (!props.id.trim()) {
      throw new DomainError("Score explanation id is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Tenant id is required.");
    }

    if (!props.controlScoreId.trim()) {
      throw new DomainError("Control score id is required.");
    }

    if (!Number.isFinite(props.contribution)) {
      throw new DomainError("Score explanation contribution must be numeric.");
    }

    if (!props.explanation.trim()) {
      throw new DomainError("Score explanation text is required.");
    }

    this.props = props;
  }

  static driverTypeFromContribution(contribution: number, fallback?: string | null) {
    const normalizedFallback = fallback?.trim().toLowerCase();

    if (
      normalizedFallback === "positive" ||
      normalizedFallback === "negative" ||
      normalizedFallback === "risk" ||
      normalizedFallback === "neutral"
    ) {
      return normalizedFallback;
    }

    if (contribution > 0) {
      return "positive";
    }

    if (contribution < 0) {
      return "negative";
    }

    return "neutral";
  }

  static severityFrom(value: string | null | undefined) {
    return normalizeDashboardSeverity(value);
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

  get domainCode() {
    return this.props.domainCode;
  }

  get metricCode() {
    return this.props.metricCode;
  }

  get metricName() {
    return this.props.metricName;
  }

  get driverType() {
    return this.props.driverType;
  }

  get contribution() {
    return this.props.contribution;
  }

  get severity() {
    return this.props.severity;
  }

  get explanation() {
    return this.props.explanation;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  toSnapshot() {
    return {
      ...this.props
    };
  }
}
