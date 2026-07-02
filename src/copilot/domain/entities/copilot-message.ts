import { DomainError } from "@/domain/errors";
import type {
  CopilotIntent,
  CopilotMessageRole
} from "@/copilot/domain/value-objects";
import type { CopilotMetadata } from "@/copilot/domain/entities/copilot-metadata";

export type CopilotMessageProps = {
  id: string;
  sessionId: string;
  role: CopilotMessageRole;
  content: string;
  intent: CopilotIntent;
  createdAt: Date;
  metadata?: CopilotMetadata;
};

export class CopilotMessage {
  private readonly props: CopilotMessageProps;

  constructor(props: CopilotMessageProps) {
    validateRequiredText(props.id, "Copilot message id is required.");
    validateRequiredText(props.sessionId, "Copilot message session id is required.");
    validateRequiredText(props.content, "Copilot message content is required.");

    this.props = {
      ...props,
      metadata: props.metadata ?? {}
    };
  }

  get id() {
    return this.props.id;
  }

  get sessionId() {
    return this.props.sessionId;
  }

  get role() {
    return this.props.role;
  }

  get content() {
    return this.props.content;
  }

  get intent() {
    return this.props.intent;
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
      metadata: this.metadata
    };
  }
}

function validateRequiredText(value: string, message: string) {
  if (!value.trim()) {
    throw new DomainError(message);
  }
}
