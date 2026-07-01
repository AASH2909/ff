import { DomainError } from "@/domain/errors";

export type DomainScoreSnapshotProps = {
  id: string;
  tenantId: string;
  controlScoreId: string;
  domainCode: string;
  domainName: string;
  score: number;
  weight: number;
  contribution: number;
  periodStart: Date;
  periodEnd: Date;
  calculatedAt: Date;
  metadata?: Record<string, unknown>;
};

export class DomainScoreSnapshot {
  private readonly props: DomainScoreSnapshotProps;

  constructor(props: DomainScoreSnapshotProps) {
    if (!props.id.trim()) {
      throw new DomainError("Domain score id is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Tenant id is required.");
    }

    if (!props.controlScoreId.trim()) {
      throw new DomainError("Control score id is required.");
    }

    if (!props.domainCode.trim()) {
      throw new DomainError("Domain code is required.");
    }

    if (!props.domainName.trim()) {
      throw new DomainError("Domain name is required.");
    }

    if (!Number.isFinite(props.score) || props.score < 0 || props.score > 100) {
      throw new DomainError("Domain score must be between 0 and 100.");
    }

    if (!Number.isFinite(props.weight) || props.weight < 0 || props.weight > 100) {
      throw new DomainError("Domain weight must be between 0 and 100.");
    }

    if (!Number.isFinite(props.contribution)) {
      throw new DomainError("Domain contribution must be numeric.");
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

  get controlScoreId() {
    return this.props.controlScoreId;
  }

  get domainCode() {
    return this.props.domainCode;
  }

  get domainName() {
    return this.props.domainName;
  }

  get score() {
    return this.props.score;
  }

  get weight() {
    return this.props.weight;
  }

  get contribution() {
    return this.props.contribution;
  }

  get periodStart() {
    return this.props.periodStart;
  }

  get periodEnd() {
    return this.props.periodEnd;
  }

  get calculatedAt() {
    return this.props.calculatedAt;
  }

  get metadata() {
    return { ...(this.props.metadata ?? {}) };
  }

  getTrend(previous: DomainScoreSnapshot | null) {
    if (!previous) {
      return "flat" as const;
    }

    if (this.score > previous.score) {
      return "up" as const;
    }

    if (this.score < previous.score) {
      return "down" as const;
    }

    return "flat" as const;
  }

  getScoreChange(previous: DomainScoreSnapshot | null) {
    if (!previous) {
      return null;
    }

    return Number((this.score - previous.score).toFixed(2));
  }

  toSnapshot() {
    return {
      ...this.props
    };
  }
}
