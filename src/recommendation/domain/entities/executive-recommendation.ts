import { DomainError } from "@/domain/errors";

export const RECOMMENDATION_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export type RecommendationPriority = (typeof RECOMMENDATION_PRIORITIES)[number];

export const RECOMMENDATION_SEVERITIES = [
  "information",
  "warning",
  "critical",
  "severe"
] as const;

export type RecommendationSeverity = (typeof RECOMMENDATION_SEVERITIES)[number];

export const RECOMMENDATION_CATEGORIES = [
  "Fraud",
  "Finance",
  "Kitchen",
  "Inventory",
  "Waste",
  "Staff",
  "Cash",
  "Operations",
  "Security",
  "Compliance",
  "Performance"
] as const;

export type RecommendationCategory = (typeof RECOMMENDATION_CATEGORIES)[number];

export const RECOMMENDATION_SOURCES = [
  "control_score",
  "domain_score",
  "score_explanation",
  "fraud_alert",
  "dashboard_alert",
  "audit_event",
  "recommendation_rule"
] as const;

export type RecommendationSource = (typeof RECOMMENDATION_SOURCES)[number];

export type ExecutiveRecommendationProps = {
  id: string;
  priority: RecommendationPriority;
  severity: RecommendationSeverity;
  category: RecommendationCategory;
  title: string;
  description: string;
  businessImpact: string;
  recommendedAction: string;
  confidence: number;
  source: RecommendationSource;
  createdAt: Date;
};

export class ExecutiveRecommendation {
  private readonly props: ExecutiveRecommendationProps;

  constructor(props: ExecutiveRecommendationProps) {
    if (!props.id.trim()) {
      throw new DomainError("Recommendation id is required.");
    }

    if (!props.title.trim()) {
      throw new DomainError("Recommendation title is required.");
    }

    if (!props.description.trim()) {
      throw new DomainError("Recommendation description is required.");
    }

    if (!props.businessImpact.trim()) {
      throw new DomainError("Recommendation business impact is required.");
    }

    if (!props.recommendedAction.trim()) {
      throw new DomainError("Recommendation action is required.");
    }

    if (!Number.isFinite(props.confidence) || props.confidence < 0 || props.confidence > 1) {
      throw new DomainError("Recommendation confidence must be between 0 and 1.");
    }

    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get priority() {
    return this.props.priority;
  }

  get severity() {
    return this.props.severity;
  }

  get category() {
    return this.props.category;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get businessImpact() {
    return this.props.businessImpact;
  }

  get recommendedAction() {
    return this.props.recommendedAction;
  }

  get confidence() {
    return this.props.confidence;
  }

  get source() {
    return this.props.source;
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
