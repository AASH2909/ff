import type {
  ControlScoreSnapshot,
  DashboardAlert,
  DomainScoreSnapshot,
  ScoreExplanation
} from "@/dashboard/domain";

export type DashboardReadScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type DashboardReadDateRange = {
  from?: Date;
  to?: Date;
  limit: number;
};

export interface DashboardReadRepository {
  findLatestControlScore(scope: DashboardReadScope): Promise<ControlScoreSnapshot | null>;
  findPreviousControlScore(
    scope: DashboardReadScope,
    beforeCalculatedAt: Date
  ): Promise<ControlScoreSnapshot | null>;
  findControlScoreHistory(
    scope: DashboardReadScope,
    range: DashboardReadDateRange
  ): Promise<ControlScoreSnapshot[]>;
  findDomainScores(scope: DashboardReadScope, controlScoreId: string): Promise<DomainScoreSnapshot[]>;
  findScoreExplanations(
    scope: DashboardReadScope,
    controlScoreId: string
  ): Promise<ScoreExplanation[]>;
  findActiveDashboardAlerts(scope: DashboardReadScope, limit: number): Promise<DashboardAlert[]>;
  findActiveRiskAlerts(scope: DashboardReadScope, limit: number): Promise<DashboardAlert[]>;
}
