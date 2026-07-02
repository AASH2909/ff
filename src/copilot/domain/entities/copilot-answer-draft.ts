import { DomainError } from "@/domain/errors";
import type { CopilotIntent } from "@/copilot/domain/value-objects";
import type { CopilotMetadata } from "@/copilot/domain/entities/copilot-metadata";

export type CopilotAnswerSourceType =
  | "ANALYTICS_CONTEXT"
  | "PREDICTIVE_ANALYTICS"
  | "EXECUTIVE_TIMELINE"
  | "DECISION_INTELLIGENCE";

export type CopilotAnswerSource = {
  sourceType: CopilotAnswerSourceType;
  referenceId: string | null;
  title: string;
  confidence: number | null;
};

export type CopilotRecommendedAction = {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceScenarioId: string | null;
};

export type CopilotAnswerDraftProps = {
  id: string;
  sessionId: string;
  intent: CopilotIntent;
  answer: string;
  confidence: number;
  sources: CopilotAnswerSource[];
  recommendedActions: CopilotRecommendedAction[];
  createdAt: Date;
  metadata?: CopilotMetadata;
};

export class CopilotAnswerDraft {
  private readonly props: CopilotAnswerDraftProps;

  constructor(props: CopilotAnswerDraftProps) {
    validateRequiredText(props.id, "Copilot answer draft id is required.");
    validateRequiredText(props.sessionId, "Copilot answer draft session id is required.");
    validateRequiredText(props.answer, "Copilot answer draft text is required.");

    if (!Number.isFinite(props.confidence) || props.confidence < 0 || props.confidence > 100) {
      throw new DomainError("Copilot answer confidence must be between 0 and 100.");
    }

    this.props = {
      ...props,
      confidence: Number(props.confidence.toFixed(2)),
      sources: [...props.sources],
      recommendedActions: [...props.recommendedActions],
      metadata: props.metadata ?? {}
    };
  }

  get id() {
    return this.props.id;
  }

  get sessionId() {
    return this.props.sessionId;
  }

  get intent() {
    return this.props.intent;
  }

  get answer() {
    return this.props.answer;
  }

  get confidence() {
    return this.props.confidence;
  }

  get sources() {
    return [...this.props.sources];
  }

  get recommendedActions() {
    return [...this.props.recommendedActions];
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
      sources: this.sources,
      recommendedActions: this.recommendedActions,
      metadata: this.metadata
    };
  }
}

function validateRequiredText(value: string, message: string) {
  if (!value.trim()) {
    throw new DomainError(message);
  }
}
