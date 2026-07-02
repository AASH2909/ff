import { DomainError } from "@/domain/errors";
import type { CopilotSessionStatus } from "@/copilot/domain/value-objects";
import type { CopilotMetadata } from "@/copilot/domain/entities/copilot-metadata";

export type CopilotSessionProps = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  status: CopilotSessionStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: CopilotMetadata;
};

export class CopilotSession {
  private readonly props: CopilotSessionProps;

  constructor(props: CopilotSessionProps) {
    validateRequiredText(props.id, "Copilot session id is required.");
    validateRequiredText(props.tenantId, "Copilot session tenant id is required.");

    if (props.updatedAt < props.createdAt) {
      throw new DomainError("Copilot session updated time cannot precede creation time.");
    }

    this.props = {
      ...props,
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

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get metadata() {
    return { ...(this.props.metadata ?? {}) };
  }

  get isActive() {
    return this.props.status === "ACTIVE";
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
