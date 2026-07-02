import { DomainError } from "@/domain/errors";
import type {
  PredictionRiskLevel,
  PredictionTrend,
  PredictionType,
  PredictionWindow
} from "@/predictive/domain/value-objects";

export type PredictionExplanation = {
  code: string;
  message: string;
  sourceData: string;
};

export type PredictionMetadataValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[];

export type PredictionMetadata = Record<string, PredictionMetadataValue>;

export type PredictionProps = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  generatedAt: Date;
  predictionType: PredictionType;
  predictionWindow: PredictionWindow;
  riskLevel: PredictionRiskLevel;
  confidence: number;
  predictedControlScore: number | null;
  trend: PredictionTrend;
  summary: string;
  explanations: PredictionExplanation[];
  recommendedActions: string[];
  metadata?: PredictionMetadata;
};

export class Prediction {
  private readonly props: PredictionProps;

  constructor(props: PredictionProps) {
    if (!props.id.trim()) {
      throw new DomainError("Prediction id is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Prediction tenant id is required.");
    }

    if (!Number.isFinite(props.confidence) || props.confidence < 0 || props.confidence > 100) {
      throw new DomainError("Prediction confidence must be between 0 and 100.");
    }

    if (
      props.predictedControlScore !== null &&
      (!Number.isFinite(props.predictedControlScore) ||
        props.predictedControlScore < 0 ||
        props.predictedControlScore > 100)
    ) {
      throw new DomainError("Predicted Control Score must be between 0 and 100.");
    }

    if (!props.summary.trim()) {
      throw new DomainError("Prediction summary is required.");
    }

    if (props.explanations.length === 0) {
      throw new DomainError("Prediction explanations are required.");
    }

    this.props = {
      ...props,
      explanations: props.explanations.map((explanation) => ({
        code: explanation.code.trim(),
        message: explanation.message.trim(),
        sourceData: explanation.sourceData.trim()
      })),
      recommendedActions: uniqueNonEmptyStrings(props.recommendedActions),
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

  get generatedAt() {
    return this.props.generatedAt;
  }

  get predictionType() {
    return this.props.predictionType;
  }

  get predictionWindow() {
    return this.props.predictionWindow;
  }

  get riskLevel() {
    return this.props.riskLevel;
  }

  get confidence() {
    return this.props.confidence;
  }

  get predictedControlScore() {
    return this.props.predictedControlScore;
  }

  get trend() {
    return this.props.trend;
  }

  get summary() {
    return this.props.summary;
  }

  get explanations() {
    return this.props.explanations.map((explanation) => ({ ...explanation }));
  }

  get recommendedActions() {
    return [...this.props.recommendedActions];
  }

  get metadata() {
    return { ...(this.props.metadata ?? {}) };
  }

  toSnapshot() {
    return {
      ...this.props,
      explanations: this.explanations,
      recommendedActions: this.recommendedActions,
      metadata: this.metadata
    };
  }
}

function uniqueNonEmptyStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
