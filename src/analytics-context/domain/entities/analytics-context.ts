import { DomainError } from "@/domain/errors";
import type {
  DashboardOverviewDto,
  ControlScoreDto
} from "@/dashboard/application";
import type { RecommendationDto } from "@/recommendation/application";
import type { ExecutiveSummaryDto } from "@/ai-summary/application";
import type { IncidentDto, NotificationDto } from "@/notification/application";
import type { AuditHighlight, FraudInsights } from "@/analytics-context/domain/services";

export type AnalyticsContextMetadataValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[];

export type AnalyticsContextMetadata = Record<string, AnalyticsContextMetadataValue>;

export type AnalyticsContextProps = {
  tenantId: string;
  businessUnitId: string | null;
  generatedAt: Date;
  controlScore: ControlScoreDto | null;
  dashboardOverview: DashboardOverviewDto | null;
  recommendations: RecommendationDto[];
  executiveSummary: ExecutiveSummaryDto | null;
  notifications: NotificationDto[];
  incidents: IncidentDto[];
  fraudInsights: FraudInsights;
  auditHighlights: AuditHighlight[];
  metadata?: AnalyticsContextMetadata;
};

export class AnalyticsContext {
  private readonly props: AnalyticsContextProps;

  constructor(props: AnalyticsContextProps) {
    if (!props.tenantId.trim()) {
      throw new DomainError("Analytics context tenant id is required.");
    }

    this.props = {
      ...props,
      recommendations: [...props.recommendations],
      notifications: [...props.notifications],
      incidents: [...props.incidents],
      auditHighlights: [...props.auditHighlights],
      metadata: props.metadata ?? {}
    };
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get businessUnitId() {
    return this.props.businessUnitId;
  }

  get generatedAt() {
    return this.props.generatedAt;
  }

  get controlScore() {
    return this.props.controlScore;
  }

  get dashboardOverview() {
    return this.props.dashboardOverview;
  }

  get recommendations() {
    return [...this.props.recommendations];
  }

  get executiveSummary() {
    return this.props.executiveSummary;
  }

  get notifications() {
    return [...this.props.notifications];
  }

  get incidents() {
    return [...this.props.incidents];
  }

  get fraudInsights() {
    return this.props.fraudInsights;
  }

  get auditHighlights() {
    return [...this.props.auditHighlights];
  }

  get metadata() {
    return { ...(this.props.metadata ?? {}) };
  }

  toSnapshot() {
    return {
      ...this.props,
      recommendations: this.recommendations,
      notifications: this.notifications,
      incidents: this.incidents,
      auditHighlights: this.auditHighlights,
      metadata: this.metadata
    };
  }
}
