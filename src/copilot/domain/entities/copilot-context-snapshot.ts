import { DomainError } from "@/domain/errors";
import type { AnalyticsContextDto } from "@/analytics-context/application";
import type { PredictionDto } from "@/predictive/application";
import type { TimelineEntryDto } from "@/timeline/application";
import type { DecisionScenarioDto } from "@/decision/application";
import type { CopilotMetadata } from "@/copilot/domain/entities/copilot-metadata";

export type CopilotContextSnapshotProps = {
  id: string;
  sessionId: string;
  analyticsContext: AnalyticsContextDto | null;
  predictions: PredictionDto[];
  timeline: TimelineEntryDto[];
  decisionScenarios: DecisionScenarioDto[];
  createdAt: Date;
  metadata?: CopilotMetadata;
};

export class CopilotContextSnapshot {
  private readonly props: CopilotContextSnapshotProps;

  constructor(props: CopilotContextSnapshotProps) {
    validateRequiredText(props.id, "Copilot context snapshot id is required.");
    validateRequiredText(props.sessionId, "Copilot context snapshot session id is required.");

    this.props = {
      ...props,
      predictions: [...props.predictions],
      timeline: [...props.timeline],
      decisionScenarios: [...props.decisionScenarios],
      metadata: props.metadata ?? {}
    };
  }

  get id() {
    return this.props.id;
  }

  get sessionId() {
    return this.props.sessionId;
  }

  get analyticsContext() {
    return this.props.analyticsContext;
  }

  get predictions() {
    return [...this.props.predictions];
  }

  get timeline() {
    return [...this.props.timeline];
  }

  get decisionScenarios() {
    return [...this.props.decisionScenarios];
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
      predictions: this.predictions,
      timeline: this.timeline,
      decisionScenarios: this.decisionScenarios,
      metadata: this.metadata
    };
  }
}

function validateRequiredText(value: string, message: string) {
  if (!value.trim()) {
    throw new DomainError(message);
  }
}
