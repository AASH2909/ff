import { DomainError } from "@/domain/errors";

export type ScoreTrendDirection = "up" | "down" | "flat";

export type ScoreTrendPointProps = {
  controlScoreId: string;
  score: number;
  status: string;
  periodStart: Date;
  periodEnd: Date;
  calculatedAt: Date;
};

export class ScoreTrendPoint {
  private readonly props: ScoreTrendPointProps;

  constructor(props: ScoreTrendPointProps) {
    if (!props.controlScoreId.trim()) {
      throw new DomainError("Control score id is required.");
    }

    if (!Number.isFinite(props.score) || props.score < 0 || props.score > 100) {
      throw new DomainError("Trend score must be between 0 and 100.");
    }

    if (!props.status.trim()) {
      throw new DomainError("Trend status is required.");
    }

    this.props = props;
  }

  get controlScoreId() {
    return this.props.controlScoreId;
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

  getDirection(previous: ScoreTrendPoint | null): ScoreTrendDirection {
    if (!previous) {
      return "flat";
    }

    if (this.score > previous.score) {
      return "up";
    }

    if (this.score < previous.score) {
      return "down";
    }

    return "flat";
  }

  toSnapshot() {
    return {
      ...this.props
    };
  }
}
