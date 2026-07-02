import { DomainError } from "@/domain/errors";
import type {
  FactorDirection,
  FactorImpact,
  PredictionRiskLevel,
  PredictionTrend,
  PredictionType,
  PredictionWindow
} from "@/predictive/domain/value-objects";

export type PredictionMetadataValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[];

export type PredictionMetadata = Record<string, PredictionMetadataValue>;

export type PredictionFactorProps = {
  id: string;
  predictionId: string;
  factorType: string;
  source: string;
  title: string;
  description: string;
  impact: FactorImpact;
  weight: number;
  direction: FactorDirection;
  evidence: string[];
};

export class PredictionFactor {
  private readonly props: PredictionFactorProps;

  constructor(props: PredictionFactorProps) {
    validateRequiredText(props.id, "Prediction factor id is required.");
    validateRequiredText(props.predictionId, "Prediction factor prediction id is required.");
    validateRequiredText(props.factorType, "Prediction factor type is required.");
    validateRequiredText(props.source, "Prediction factor source is required.");
    validateRequiredText(props.title, "Prediction factor title is required.");
    validateRequiredText(props.description, "Prediction factor description is required.");

    if (!Number.isFinite(props.weight) || props.weight < 0 || props.weight > 100) {
      throw new DomainError("Prediction factor weight must be between 0 and 100.");
    }

    const evidence = uniqueNonEmptyStrings(props.evidence);

    if (evidence.length === 0) {
      throw new DomainError("Prediction factor evidence is required.");
    }

    this.props = {
      ...props,
      evidence
    };
  }

  get id() {
    return this.props.id;
  }

  get predictionId() {
    return this.props.predictionId;
  }

  get factorType() {
    return this.props.factorType;
  }

  get source() {
    return this.props.source;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get impact() {
    return this.props.impact;
  }

  get weight() {
    return this.props.weight;
  }

  get direction() {
    return this.props.direction;
  }

  get evidence() {
    return [...this.props.evidence];
  }

  toSnapshot() {
    return {
      ...this.props,
      evidence: this.evidence
    };
  }
}

export type PredictionScenarioProps = {
  id: string;
  predictionId: string;
  scenarioType: string;
  title: string;
  description: string;
  expectedImpact: string;
  confidence: number;
  assumptions: string[];
};

export class PredictionScenario {
  private readonly props: PredictionScenarioProps;

  constructor(props: PredictionScenarioProps) {
    validateRequiredText(props.id, "Prediction scenario id is required.");
    validateRequiredText(props.predictionId, "Prediction scenario prediction id is required.");
    validateRequiredText(props.scenarioType, "Prediction scenario type is required.");
    validateRequiredText(props.title, "Prediction scenario title is required.");
    validateRequiredText(props.description, "Prediction scenario description is required.");
    validateRequiredText(props.expectedImpact, "Prediction scenario expected impact is required.");

    if (!Number.isFinite(props.confidence) || props.confidence < 0 || props.confidence > 100) {
      throw new DomainError("Prediction scenario confidence must be between 0 and 100.");
    }

    const assumptions = uniqueNonEmptyStrings(props.assumptions);

    if (assumptions.length === 0) {
      throw new DomainError("Prediction scenario assumptions are required.");
    }

    this.props = {
      ...props,
      assumptions
    };
  }

  get id() {
    return this.props.id;
  }

  get predictionId() {
    return this.props.predictionId;
  }

  get scenarioType() {
    return this.props.scenarioType;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get expectedImpact() {
    return this.props.expectedImpact;
  }

  get confidence() {
    return this.props.confidence;
  }

  get assumptions() {
    return [...this.props.assumptions];
  }

  toSnapshot() {
    return {
      ...this.props,
      assumptions: this.assumptions
    };
  }
}

export type PredictionProps = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  predictionType: PredictionType;
  predictionWindow: PredictionWindow;
  riskLevel: PredictionRiskLevel;
  trend: PredictionTrend;
  confidence: number;
  summary: string;
  predictedControlScore: number | null;
  factors: PredictionFactor[];
  scenarios: PredictionScenario[];
  createdAt: Date;
  metadata?: PredictionMetadata;
};

export class Prediction {
  private readonly props: PredictionProps;

  constructor(props: PredictionProps) {
    validateRequiredText(props.id, "Prediction id is required.");
    validateRequiredText(props.tenantId, "Prediction tenant id is required.");
    validateRequiredText(props.summary, "Prediction summary is required.");

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

    if (props.factors.length === 0) {
      throw new DomainError("Prediction factors are required.");
    }

    if (props.scenarios.length === 0) {
      throw new DomainError("Prediction scenarios are required.");
    }

    this.props = {
      ...props,
      factors: [...props.factors],
      scenarios: [...props.scenarios],
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

  get predictionType() {
    return this.props.predictionType;
  }

  get predictionWindow() {
    return this.props.predictionWindow;
  }

  get riskLevel() {
    return this.props.riskLevel;
  }

  get trend() {
    return this.props.trend;
  }

  get confidence() {
    return this.props.confidence;
  }

  get summary() {
    return this.props.summary;
  }

  get predictedControlScore() {
    return this.props.predictedControlScore;
  }

  get factors() {
    return [...this.props.factors];
  }

  get scenarios() {
    return [...this.props.scenarios];
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get metadata() {
    return { ...(this.props.metadata ?? {}) };
  }

  toSnapshot() {
    return {
      ...this.props,
      factors: this.factors.map((factor) => factor.toSnapshot()),
      scenarios: this.scenarios.map((scenario) => scenario.toSnapshot()),
      metadata: this.metadata
    };
  }
}

function validateRequiredText(value: string, message: string) {
  if (!value.trim()) {
    throw new DomainError(message);
  }
}

function uniqueNonEmptyStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
