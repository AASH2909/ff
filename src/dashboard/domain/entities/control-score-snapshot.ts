import { DomainError } from "@/domain/errors";

export type ControlScoreSnapshotProps = {
  id: string;
  tenantId: string;
  businessUnitId: string;
  businessUnitName: string | null;
  score: number;
  status: string;
  periodStart: Date;
  periodEnd: Date;
  calculatedAt: Date;
};

export class ControlScoreSnapshot {
  private readonly props: ControlScoreSnapshotProps;

  constructor(props: ControlScoreSnapshotProps) {
    if (!props.id.trim()) {
      throw new DomainError("Control score id is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Tenant id is required.");
    }

    if (!props.businessUnitId.trim()) {
      throw new DomainError("Business unit id is required.");
    }

    if (!Number.isFinite(props.score) || props.score < 0 || props.score > 100) {
      throw new DomainError("Control score must be between 0 and 100.");
    }

    if (!props.status.trim()) {
      throw new DomainError("Control score status is required.");
    }

    if (props.periodStart > props.periodEnd) {
      throw new DomainError("Control score period start cannot be after period end.");
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

  get businessUnitName() {
    return this.props.businessUnitName;
  }

  get score() {
    return this.props.score;
  }

  get status() {
    return this.props.status;
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

  getScoreChange(previous: ControlScoreSnapshot | null) {
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
