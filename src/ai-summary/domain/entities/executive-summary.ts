import { DomainError } from "@/domain/errors";
import type {
  ExecutiveSummaryStatus,
  ExecutiveSummaryType
} from "@/ai-summary/domain/value-objects";

export type ExecutiveSummaryMetadataValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[];

export type ExecutiveSummaryMetadata = Record<string, ExecutiveSummaryMetadataValue>;

export type ExecutiveSummaryProps = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  periodStart: Date;
  periodEnd: Date;
  summaryType: ExecutiveSummaryType;
  status: ExecutiveSummaryStatus;
  headline: string;
  overallAssessment: string;
  keyPositiveSignals: string[];
  keyNegativeSignals: string[];
  criticalRisks: string[];
  recommendedActions: string[];
  confidence: number;
  sourceModules: string[];
  generatedAt: Date;
  metadata?: ExecutiveSummaryMetadata;
};

export class ExecutiveSummary {
  private readonly props: ExecutiveSummaryProps;

  constructor(props: ExecutiveSummaryProps) {
    if (!props.id.trim()) {
      throw new DomainError("Executive summary id is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Tenant id is required.");
    }

    if (props.periodStart > props.periodEnd) {
      throw new DomainError("Executive summary period start cannot be after period end.");
    }

    if (!props.headline.trim()) {
      throw new DomainError("Executive summary headline is required.");
    }

    if (!props.overallAssessment.trim()) {
      throw new DomainError("Executive summary overall assessment is required.");
    }

    if (!Number.isFinite(props.confidence) || props.confidence < 0 || props.confidence > 1) {
      throw new DomainError("Executive summary confidence must be between 0 and 1.");
    }

    this.props = {
      ...props,
      keyPositiveSignals: uniqueNonEmptyStrings(props.keyPositiveSignals),
      keyNegativeSignals: uniqueNonEmptyStrings(props.keyNegativeSignals),
      criticalRisks: uniqueNonEmptyStrings(props.criticalRisks),
      recommendedActions: uniqueNonEmptyStrings(props.recommendedActions),
      sourceModules: uniqueNonEmptyStrings(props.sourceModules),
      metadata: props.metadata ?? {}
    };
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

  get periodStart() {
    return this.props.periodStart;
  }

  get periodEnd() {
    return this.props.periodEnd;
  }

  get summaryType() {
    return this.props.summaryType;
  }

  get status() {
    return this.props.status;
  }

  get headline() {
    return this.props.headline;
  }

  get overallAssessment() {
    return this.props.overallAssessment;
  }

  get keyPositiveSignals() {
    return [...this.props.keyPositiveSignals];
  }

  get keyNegativeSignals() {
    return [...this.props.keyNegativeSignals];
  }

  get criticalRisks() {
    return [...this.props.criticalRisks];
  }

  get recommendedActions() {
    return [...this.props.recommendedActions];
  }

  get confidence() {
    return this.props.confidence;
  }

  get sourceModules() {
    return [...this.props.sourceModules];
  }

  get generatedAt() {
    return this.props.generatedAt;
  }

  get metadata() {
    return { ...(this.props.metadata ?? {}) };
  }

  toSnapshot() {
    return {
      ...this.props,
      keyPositiveSignals: this.keyPositiveSignals,
      keyNegativeSignals: this.keyNegativeSignals,
      criticalRisks: this.criticalRisks,
      recommendedActions: this.recommendedActions,
      sourceModules: this.sourceModules,
      metadata: this.metadata
    };
  }
}

function uniqueNonEmptyStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
