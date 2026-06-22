import { DomainError } from "@/domain/errors";

export type CurrencyCode = "USD" | "UZS";

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: CurrencyCode
  ) {
    if (!Number.isInteger(amount)) {
      throw new DomainError("Money amount must be an integer minor-unit value.");
    }

    if (amount < 0) {
      throw new DomainError("Money amount cannot be negative.");
    }
  }

  static zero(currency: CurrencyCode = "USD") {
    return new Money(0, currency);
  }

  static fromMinor(amount: number, currency: CurrencyCode = "USD") {
    return new Money(amount, currency);
  }

  add(other: Money) {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money) {
    this.assertSameCurrency(other);

    if (other.amount > this.amount) {
      throw new DomainError("Money subtraction cannot produce a negative amount.");
    }

    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new DomainError("Money multiplier must be a non-negative integer.");
    }

    return new Money(this.amount * quantity, this.currency);
  }

  equals(other: Money) {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isZero() {
    return this.amount === 0;
  }

  private assertSameCurrency(other: Money) {
    if (this.currency !== other.currency) {
      throw new DomainError("Money currency mismatch.");
    }
  }
}
