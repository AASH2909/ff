import { DomainError } from "@/domain/errors";
import type { TimelineRelationType } from "@/timeline/domain/value-objects";

export type TimelineLinkProps = {
  sourceEntryId: string;
  targetEntryId: string;
  relationType: TimelineRelationType;
  confidence: number;
};

export class TimelineLink {
  private readonly props: TimelineLinkProps;

  constructor(props: TimelineLinkProps) {
    if (!props.sourceEntryId.trim()) {
      throw new DomainError("Timeline link source entry id is required.");
    }

    if (!props.targetEntryId.trim()) {
      throw new DomainError("Timeline link target entry id is required.");
    }

    if (props.sourceEntryId === props.targetEntryId) {
      throw new DomainError("Timeline link cannot target the same entry.");
    }

    if (!Number.isFinite(props.confidence) || props.confidence < 0 || props.confidence > 100) {
      throw new DomainError("Timeline link confidence must be between 0 and 100.");
    }

    this.props = props;
  }

  get sourceEntryId() {
    return this.props.sourceEntryId;
  }

  get targetEntryId() {
    return this.props.targetEntryId;
  }

  get relationType() {
    return this.props.relationType;
  }

  get confidence() {
    return this.props.confidence;
  }

  toSnapshot() {
    return { ...this.props };
  }
}
