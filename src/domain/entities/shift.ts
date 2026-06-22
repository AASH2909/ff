import { DomainError } from "@/domain/errors";
import { Money, type CurrencyCode } from "@/domain/value-objects/money";

export type ShiftStatus = "open" | "closed";

export type ShiftProps = {
  id: string;
  tenantId: string;
  cashierId: string;
  currency?: CurrencyCode;
  openingCash: Money;
  status?: ShiftStatus;
  openedAt?: Date;
  closedAt?: Date | null;
  closingCash?: Money | null;
};

export class Shift {
  private readonly props: {
    id: string;
    tenantId: string;
    cashierId: string;
    currency: CurrencyCode;
    openingCash: Money;
    status: ShiftStatus;
    openedAt: Date;
    closedAt: Date | null;
    closingCash: Money | null;
  };

  constructor(props: ShiftProps) {
    if (!props.id.trim()) {
      throw new DomainError("Shift id is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Shift tenant id is required.");
    }

    if (!props.cashierId.trim()) {
      throw new DomainError("Shift cashier id is required.");
    }

    this.props = {
      id: props.id,
      tenantId: props.tenantId,
      cashierId: props.cashierId,
      currency: props.currency ?? props.openingCash.currency,
      openingCash: props.openingCash,
      status: props.status ?? "open",
      openedAt: props.openedAt ?? new Date(),
      closedAt: props.closedAt ?? null,
      closingCash: props.closingCash ?? null
    };

    if (this.props.openingCash.currency !== this.props.currency) {
      throw new DomainError("Opening cash currency must match shift currency.");
    }
  }

  get id() {
    return this.props.id;
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get status() {
    return this.props.status;
  }

  get expectedCash() {
    return this.props.openingCash;
  }

  close(closingCash: Money, closedAt = new Date()) {
    if (this.props.status !== "open") {
      throw new DomainError("Only open shifts can be closed.");
    }

    if (closingCash.currency !== this.props.currency) {
      throw new DomainError("Closing cash currency must match shift currency.");
    }

    this.props.status = "closed";
    this.props.closingCash = closingCash;
    this.props.closedAt = closedAt;
  }

  toSnapshot() {
    return { ...this.props };
  }
}
