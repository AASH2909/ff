import { DomainError } from "@/domain/errors";
import type { ControlScoreSnapshot } from "@/dashboard/domain/entities/control-score-snapshot";
import type { DashboardAlert } from "@/dashboard/domain/entities/dashboard-alert";
import type { DomainScoreSnapshot } from "@/dashboard/domain/entities/domain-score-snapshot";
import type { ScoreExplanation } from "@/dashboard/domain/entities/score-explanation";

export type DashboardOverviewProps = {
  currentControlScore: ControlScoreSnapshot;
  previousControlScore: ControlScoreSnapshot | null;
  domainScores: DomainScoreSnapshot[];
  previousDomainScores: DomainScoreSnapshot[];
  explanations: ScoreExplanation[];
  activeAlerts: DashboardAlert[];
};

export class DashboardOverview {
  private readonly props: DashboardOverviewProps;

  constructor(props: DashboardOverviewProps) {
    if (props.currentControlScore.tenantId.trim().length === 0) {
      throw new DomainError("Dashboard overview requires a tenant-scoped Control Score.");
    }

    this.props = props;
  }

  get currentControlScore() {
    return this.props.currentControlScore;
  }

  get previousControlScore() {
    return this.props.previousControlScore;
  }

  get domainScores() {
    return [...this.props.domainScores];
  }

  get previousDomainScores() {
    return [...this.props.previousDomainScores];
  }

  get explanations() {
    return [...this.props.explanations];
  }

  get activeAlerts() {
    return [...this.props.activeAlerts];
  }

  get lastCalculationTime() {
    return this.props.currentControlScore.calculatedAt;
  }

  toSnapshot() {
    return {
      currentControlScore: this.currentControlScore.toSnapshot(),
      previousControlScore: this.previousControlScore?.toSnapshot() ?? null,
      domainScores: this.domainScores.map((domainScore) => domainScore.toSnapshot()),
      previousDomainScores: this.previousDomainScores.map((domainScore) => domainScore.toSnapshot()),
      explanations: this.explanations.map((explanation) => explanation.toSnapshot()),
      activeAlerts: this.activeAlerts.map((alert) => alert.toSnapshot()),
      lastCalculationTime: this.lastCalculationTime
    };
  }
}
