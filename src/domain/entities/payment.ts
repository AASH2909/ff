import { DomainError } from "@/domain/errors";
import { Money } from "@/domain/value-objects/money";

export type PaymentMethod = "cash" | "card" | "online";
export type PaymentStatus = "pending" | "captured" | "refunded";

export type PaymentProps = {
  id: string;
  orderId: string;
  amount: Money;
  method: PaymentMethod;
  status?: PaymentStatus;
  paidAt?: Date | null;
  refundedAt?: Date | null;
};

export class Payment {
  private readonly props: Required<Omit<PaymentProps, "paidAt" | "refundedAt" | "status">> & {
    status: PaymentStatus;
    paidAt: Date | null;
    refundedAt: Date | null;
  };

  constructor(props: PaymentProps) {
    if (!props.id.trim()) {
      throw new DomainError("Payment id is required.");
    }

    if (!props.orderId.trim()) {
      throw new DomainError("Payment order id is required.");
    }

    if (props.amount.isZero()) {
      throw new DomainError("Payment amount must be greater than zero.");
    }

    this.props = {
      id: props.id,
      orderId: props.orderId,
      amount: props.amount,
      method: props.method,
      status: props.status ?? "pending",
      paidAt: props.paidAt ?? null,
      refundedAt: props.refundedAt ?? null
    };
  }

  get id() {
    return this.props.id;
  }

  get orderId() {
    return this.props.orderId;
  }

  get amount() {
    return this.props.amount;
  }

  get method() {
    return this.props.method;
  }

  get status() {
    return this.props.status;
  }

  capture(paidAt = new Date()) {
    if (this.props.status !== "pending") {
      throw new DomainError("Only pending payments can be captured.");
    }

    this.props.status = "captured";
    this.props.paidAt = paidAt;
  }

  refund(refundedAt = new Date()) {
    if (this.props.status !== "captured") {
      throw new DomainError("Only captured payments can be refunded.");
    }

    this.props.status = "refunded";
    this.props.refundedAt = refundedAt;
  }

  toSnapshot() {
    return { ...this.props };
  }
}
