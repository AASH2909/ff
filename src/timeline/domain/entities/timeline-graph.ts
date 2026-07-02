import { DomainError } from "@/domain/errors";
import { TimelineEntry } from "@/timeline/domain/entities/timeline-entry";
import { TimelineLink } from "@/timeline/domain/entities/timeline-link";

export type TimelineGraphProps = {
  tenantId: string;
  businessUnitId: string | null;
  generatedAt: Date;
  entries: TimelineEntry[];
  links: TimelineLink[];
};

export class TimelineGraph {
  private readonly props: TimelineGraphProps;

  constructor(props: TimelineGraphProps) {
    if (!props.tenantId.trim()) {
      throw new DomainError("Timeline graph tenant id is required.");
    }

    const entryIds = new Set(props.entries.map((entry) => entry.id));
    const validLinks = props.links.filter(
      (link) => entryIds.has(link.sourceEntryId) && entryIds.has(link.targetEntryId)
    );

    this.props = {
      ...props,
      entries: sortEntries(props.entries),
      links: dedupeLinks(validLinks)
    };
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

  get entries() {
    return [...this.props.entries];
  }

  get links() {
    return [...this.props.links];
  }

  toSnapshot() {
    return {
      ...this.props,
      entries: this.entries.map((entry) => entry.toSnapshot()),
      links: this.links.map((link) => link.toSnapshot())
    };
  }
}

function sortEntries(entries: TimelineEntry[]) {
  return [...entries].sort((left, right) => {
    const occurredAtDifference = right.occurredAt.getTime() - left.occurredAt.getTime();

    if (occurredAtDifference !== 0) {
      return occurredAtDifference;
    }

    return left.id.localeCompare(right.id);
  });
}

function dedupeLinks(links: TimelineLink[]) {
  const byKey = new Map<string, TimelineLink>();

  links.forEach((link) => {
    const key = `${link.sourceEntryId}:${link.targetEntryId}:${link.relationType}`;
    const existing = byKey.get(key);

    if (!existing || link.confidence > existing.confidence) {
      byKey.set(key, link);
    }
  });

  return [...byKey.values()];
}
