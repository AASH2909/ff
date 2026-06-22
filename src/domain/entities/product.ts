import { DomainError } from "@/domain/errors";
import { Money } from "@/domain/value-objects/money";

export type ProductProps = {
  id: string;
  name: string;
  price: Money;
  sku?: string;
  isActive?: boolean;
};

export class Product {
  private readonly props: Required<Omit<ProductProps, "sku">> & {
    sku: string | null;
  };

  constructor(props: ProductProps) {
    if (!props.id.trim()) {
      throw new DomainError("Product id is required.");
    }

    if (!props.name.trim()) {
      throw new DomainError("Product name is required.");
    }

    this.props = {
      id: props.id,
      name: props.name.trim(),
      price: props.price,
      sku: props.sku?.trim() || null,
      isActive: props.isActive ?? true
    };
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get price() {
    return this.props.price;
  }

  get sku() {
    return this.props.sku;
  }

  get isActive() {
    return this.props.isActive;
  }

  rename(name: string) {
    if (!name.trim()) {
      throw new DomainError("Product name is required.");
    }

    this.props.name = name.trim();
  }

  changePrice(price: Money) {
    this.props.price = price;
  }

  activate() {
    this.props.isActive = true;
  }

  deactivate() {
    this.props.isActive = false;
  }

  assertCanBeSold() {
    if (!this.props.isActive) {
      throw new DomainError("Inactive products cannot be sold.");
    }
  }

  toSnapshot() {
    return { ...this.props };
  }
}
