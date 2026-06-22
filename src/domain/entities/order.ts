import { DomainError } from "@/domain/errors";
import { Payment, type PaymentMethod } from "@/domain/entities/payment";
import { Product } from "@/domain/entities/product";
import { Money, type CurrencyCode } from "@/domain/value-objects/money";

export type OrderStatus = "draft" | "open" | "paid" | "cancelled" | "refunded";

export type OrderItemSnapshot = {
  id: string;
  productId: string;
  name: string;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
};

export type OrderProps = {
  id: string;
  currency?: CurrencyCode;
  status?: OrderStatus;
  items?: OrderItemSnapshot[];
  payment?: Payment | null;
  openedAt?: Date;
  cancelledAt?: Date | null;
  paidAt?: Date | null;
  refundedAt?: Date | null;
};

export class Order {
  private readonly props: {
    id: string;
    currency: CurrencyCode;
    status: OrderStatus;
    items: OrderItemSnapshot[];
    payment: Payment | null;
    openedAt: Date;
    cancelledAt: Date | null;
    paidAt: Date | null;
    refundedAt: Date | null;
  };

  constructor(props: OrderProps) {
    if (!props.id.trim()) {
      throw new DomainError("Order id is required.");
    }

    this.props = {
      id: props.id,
      currency: props.currency ?? "USD",
      status: props.status ?? "draft",
      items: props.items ?? [],
      payment: props.payment ?? null,
      openedAt: props.openedAt ?? new Date(),
      cancelledAt: props.cancelledAt ?? null,
      paidAt: props.paidAt ?? null,
      refundedAt: props.refundedAt ?? null
    };
  }

  get id() {
    return this.props.id;
  }

  get status() {
    return this.props.status;
  }

  get items() {
    return this.props.items.map((item) => ({ ...item }));
  }

  get total() {
    return this.props.items.reduce(
      (total, item) => total.add(item.lineTotal),
      Money.zero(this.props.currency)
    );
  }

  addItem(product: Product, quantity = 1) {
    this.assertCanModifyItems();
    product.assertCanBeSold();

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainError("Order item quantity must be a positive integer.");
    }

    if (product.price.currency !== this.props.currency) {
      throw new DomainError("Product currency must match order currency.");
    }

    const existingItem = this.props.items.find((item) => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.lineTotal = existingItem.unitPrice.multiply(existingItem.quantity);
    } else {
      this.props.items.push({
        id: `${this.props.id}:${product.id}`,
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        lineTotal: product.price.multiply(quantity)
      });
    }

    if (this.props.status === "draft") {
      this.props.status = "open";
    }
  }

  removeItem(productId: string, quantity?: number) {
    this.assertCanModifyItems();

    if (!productId.trim()) {
      throw new DomainError("Product id is required.");
    }

    if (quantity !== undefined && (!Number.isInteger(quantity) || quantity <= 0)) {
      throw new DomainError("Removed quantity must be a positive integer.");
    }

    const existingItemIndex = this.props.items.findIndex((item) => item.productId === productId);

    if (existingItemIndex === -1) {
      throw new DomainError("Order item was not found.");
    }

    const existingItem = this.props.items[existingItemIndex];

    if (!existingItem) {
      throw new DomainError("Order item was not found.");
    }

    if (quantity === undefined || quantity >= existingItem.quantity) {
      this.props.items.splice(existingItemIndex, 1);
    } else {
      existingItem.quantity -= quantity;
      existingItem.lineTotal = existingItem.unitPrice.multiply(existingItem.quantity);
    }

    if (this.props.items.length === 0) {
      this.props.status = "draft";
    }
  }

  cancel(cancelledAt = new Date()) {
    if (this.props.status === "paid" || this.props.status === "refunded") {
      throw new DomainError("Paid or refunded orders cannot be cancelled.");
    }

    if (this.props.status === "cancelled") {
      throw new DomainError("Order is already cancelled.");
    }

    this.props.status = "cancelled";
    this.props.cancelledAt = cancelledAt;
  }

  markPaid(method: PaymentMethod, paidAt = new Date()) {
    if (this.props.status !== "open") {
      throw new DomainError("Only open orders can be marked paid.");
    }

    if (this.props.items.length === 0) {
      throw new DomainError("Cannot pay an order without items.");
    }

    const payment = new Payment({
      id: `${this.props.id}:payment`,
      orderId: this.props.id,
      amount: this.total,
      method
    });

    payment.capture(paidAt);
    this.props.payment = payment;
    this.props.status = "paid";
    this.props.paidAt = paidAt;
  }

  refund(refundedAt = new Date()) {
    if (this.props.status !== "paid") {
      throw new DomainError("Only paid orders can be refunded.");
    }

    if (!this.props.payment) {
      throw new DomainError("Cannot refund an order without a payment.");
    }

    this.props.payment.refund(refundedAt);
    this.props.status = "refunded";
    this.props.refundedAt = refundedAt;
  }

  toSnapshot() {
    return {
      ...this.props,
      items: this.items,
      payment: this.props.payment?.toSnapshot() ?? null,
      total: this.total
    };
  }

  private assertCanModifyItems() {
    if (this.props.status !== "draft" && this.props.status !== "open") {
      throw new DomainError("Order items can only be modified before payment.");
    }
  }
}
