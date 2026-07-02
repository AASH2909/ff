import { DomainError } from "@/domain/errors";
import type { ActionEffort, DecisionPriority } from "@/decision/domain/value-objects";

export type DecisionActionProps = {
  id: string;
  scenarioId: string;
  actionType: string;
  title: string;
  description: string;
  expectedEffect: string;
  effort: ActionEffort;
  priority: DecisionPriority;
};

export class DecisionAction {
  private readonly props: DecisionActionProps;

  constructor(props: DecisionActionProps) {
    validateRequiredText(props.id, "Decision action id is required.");
    validateRequiredText(props.scenarioId, "Decision action scenario id is required.");
    validateRequiredText(props.actionType, "Decision action type is required.");
    validateRequiredText(props.title, "Decision action title is required.");
    validateRequiredText(props.description, "Decision action description is required.");
    validateRequiredText(props.expectedEffect, "Decision action expected effect is required.");

    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get scenarioId() {
    return this.props.scenarioId;
  }

  get actionType() {
    return this.props.actionType;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get expectedEffect() {
    return this.props.expectedEffect;
  }

  get effort() {
    return this.props.effort;
  }

  get priority() {
    return this.props.priority;
  }

  toSnapshot() {
    return {
      ...this.props
    };
  }
}

function validateRequiredText(value: string, message: string) {
  if (!value.trim()) {
    throw new DomainError(message);
  }
}
