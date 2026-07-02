import { DomainError } from "@/domain/errors";
import type { ScenarioType } from "@/decision/domain/value-objects";
import type { DecisionAction } from "@/decision/domain/entities/decision-action";
import type { DecisionImpact } from "@/decision/domain/entities/decision-impact";

export type DecisionScenarioMetadataValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[];

export type DecisionScenarioMetadata = Record<string, DecisionScenarioMetadataValue>;

export type DecisionScenarioProps = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  scenarioType: ScenarioType;
  title: string;
  description: string;
  estimatedImpact: DecisionImpact;
  confidence: number;
  assumptions: string[];
  risks: string[];
  actions: DecisionAction[];
  createdAt: Date;
  metadata?: DecisionScenarioMetadata;
};

export class DecisionScenario {
  private readonly props: DecisionScenarioProps;

  constructor(props: DecisionScenarioProps) {
    validateRequiredText(props.id, "Decision scenario id is required.");
    validateRequiredText(props.tenantId, "Decision scenario tenant id is required.");
    validateRequiredText(props.title, "Decision scenario title is required.");
    validateRequiredText(props.description, "Decision scenario description is required.");

    if (!Number.isFinite(props.confidence) || props.confidence < 0 || props.confidence > 100) {
      throw new DomainError("Decision scenario confidence must be between 0 and 100.");
    }

    const assumptions = uniqueNonEmptyStrings(props.assumptions);
    const risks = uniqueNonEmptyStrings(props.risks);

    if (assumptions.length === 0) {
      throw new DomainError("Decision scenario assumptions are required.");
    }

    if (risks.length === 0) {
      throw new DomainError("Decision scenario risks are required.");
    }

    if (props.actions.length === 0) {
      throw new DomainError("Decision scenario actions are required.");
    }

    this.props = {
      ...props,
      confidence: Number(props.confidence.toFixed(2)),
      assumptions,
      risks,
      actions: [...props.actions],
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

  get scenarioType() {
    return this.props.scenarioType;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get estimatedImpact() {
    return this.props.estimatedImpact;
  }

  get confidence() {
    return this.props.confidence;
  }

  get assumptions() {
    return [...this.props.assumptions];
  }

  get risks() {
    return [...this.props.risks];
  }

  get actions() {
    return [...this.props.actions];
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
      estimatedImpact: this.estimatedImpact.toSnapshot(),
      assumptions: this.assumptions,
      risks: this.risks,
      actions: this.actions.map((action) => action.toSnapshot()),
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
