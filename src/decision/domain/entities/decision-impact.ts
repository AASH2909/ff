import { DomainError } from "@/domain/errors";

export type DecisionImpactProps = {
  controlScoreDelta: number;
  riskLevelChange: string;
  estimatedTimeToImpact: string;
  affectedDomains: string[];
};

export class DecisionImpact {
  private readonly props: DecisionImpactProps;

  constructor(props: DecisionImpactProps) {
    if (
      !Number.isFinite(props.controlScoreDelta) ||
      props.controlScoreDelta < -100 ||
      props.controlScoreDelta > 100
    ) {
      throw new DomainError("Decision impact Control Score delta must be between -100 and 100.");
    }

    validateRequiredText(props.riskLevelChange, "Decision impact risk level change is required.");
    validateRequiredText(
      props.estimatedTimeToImpact,
      "Decision impact estimated time to impact is required."
    );

    const affectedDomains = uniqueNonEmptyStrings(props.affectedDomains);

    if (affectedDomains.length === 0) {
      throw new DomainError("Decision impact affected domains are required.");
    }

    this.props = {
      ...props,
      controlScoreDelta: Number(props.controlScoreDelta.toFixed(2)),
      affectedDomains
    };
  }

  get controlScoreDelta() {
    return this.props.controlScoreDelta;
  }

  get riskLevelChange() {
    return this.props.riskLevelChange;
  }

  get estimatedTimeToImpact() {
    return this.props.estimatedTimeToImpact;
  }

  get affectedDomains() {
    return [...this.props.affectedDomains];
  }

  toSnapshot() {
    return {
      ...this.props,
      affectedDomains: this.affectedDomains
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
