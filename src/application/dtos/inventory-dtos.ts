import type { InventoryItem } from "@/domain";
import type { CorrelatedInputDto } from "@/application/dtos/common-dtos";

export type InventoryItemDto = {
  id: string;
  tenantId: string;
  productId: string;
  availableQuantity: number;
};

export type ReceiveInventoryInputDto = CorrelatedInputDto & {
  tenantId: string;
  productId: string;
  quantity: number;
};

export type ReceiveInventoryOutputDto = {
  inventoryItem: InventoryItemDto;
};

export type WriteOffInventoryInputDto = CorrelatedInputDto & {
  tenantId: string;
  productId: string;
  quantity: number;
  reason?: string;
};

export type WriteOffInventoryOutputDto = {
  inventoryItem: InventoryItemDto;
};

export function toInventoryItemDto(inventoryItem: InventoryItem): InventoryItemDto {
  const snapshot = inventoryItem.toSnapshot();

  return {
    id: snapshot.id,
    tenantId: snapshot.tenantId,
    productId: snapshot.productId,
    availableQuantity: snapshot.availableQuantity
  };
}
