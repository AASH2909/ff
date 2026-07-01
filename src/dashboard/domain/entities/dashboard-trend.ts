import { DomainError } from "@/domain/errors";
import type { ScoreTrendPoint } from "@/dashboard/domain/entities/score-trend-point";

export type DashboardTrendProps = {
  points: ScoreTrendPoint[];
};

export class DashboardTrend {
  private readonly props: DashboardTrendProps;

  constructor(props: DashboardTrendProps) {
    const sortedPoints = [...props.points].sort(
      (left, right) => left.calculatedAt.getTime() - right.calculatedAt.getTime()
    );

    for (let index = 1; index < sortedPoints.length; index += 1) {
      const previous = sortedPoints[index - 1];
      const current = sortedPoints[index];

      if (previous && current && previous.calculatedAt.getTime() > current.calculatedAt.getTime()) {
        throw new DomainError("Dashboard trend points must be chronological.");
      }
    }

    this.props = {
      points: sortedPoints
    };
  }

  get points() {
    return [...this.props.points];
  }

  get latestPoint() {
    return this.props.points[this.props.points.length - 1] ?? null;
  }

  get previousPoint() {
    return this.props.points[this.props.points.length - 2] ?? null;
  }

  toSnapshot() {
    return {
      points: this.points.map((point) => point.toSnapshot()),
      latestPoint: this.latestPoint?.toSnapshot() ?? null,
      previousPoint: this.previousPoint?.toSnapshot() ?? null
    };
  }
}
