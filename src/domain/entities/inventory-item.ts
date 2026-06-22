import { DomainError } from "@/domain/errors";

export type InventoryItemProps = {
  id: string;
  tenantId: string;
  productId: string;
  availableQuantity?: number;
};

export type InventoryItemSnapshot = {
  id: string;
  tenantId: string;
  productId: string;
  availableQuantity: number;
};

export class InventoryItem {
  private readonly props: {
    id: string;
    tenantId: string;
    productId: string;
    availableQuantity: number;
  };

  constructor(props: InventoryItemProps) {
    if (!props.id.trim()) {
      throw new DomainError("Inventory item id is required.");
    }

    if (!props.tenantId.trim()) {
      throw new DomainError("Inventory item tenant id is required.");
    }

    if (!props.productId.trim()) {
      throw new DomainError("Inventory item product id is required.");
    }

    if (props.availableQuantity !== undefined && (!Number.isInteger(props.availableQuantity) || props.availableQuantity < 0)) {
      throw new DomainError("Inventory quantity must be a non-negative integer.");
    }

    this.props = {
      id: props.id,
      tenantId: props.tenantId,
      productId: props.productId,
      availableQuantity: props.availableQuantity ?? 0
    };
  }

  get id(): string {
    return this.props.id;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get availableQuantity(): number {
    return this.props.availableQuantity;
  }

  receive(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainError("Received quantity must be a positive integer.");
    }

    this.props.availableQuantity += quantity;
  }

  writeOff(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainError("Write-off quantity must be a positive integer.");
    }

    if (quantity > this.props.availableQuantity) {
      throw new DomainError("Write-off quantity cannot exceed available inventory.");
    }

    this.props.availableQuantity -= quantity;
  }

  toSnapshot(): InventoryItemSnapshot {
    return {
      id: this.props.id,
      tenantId: this.props.tenantId,
      productId: this.props.productId,
      availableQuantity: this.props.availableQuantity
    };
  }
}
