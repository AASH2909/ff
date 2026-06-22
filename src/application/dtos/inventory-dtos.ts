export type InventoryItemDto = {
  id: string;
  tenantId: string;
  productId: string;
  availableQuantity: number;
};

export type ReceiveInventoryInputDto = {
  tenantId: string;
  productId: string;
  quantity: number;
};

export type ReceiveInventoryOutputDto = {
  inventoryItem: InventoryItemDto;
};

export type WriteOffInventoryInputDto = {
  tenantId: string;
  productId: string;
  quantity: number;
};

export type WriteOffInventoryOutputDto = {
  inventoryItem: InventoryItemDto;
};

export function toInventoryItemDto(inventoryItem: import("@/domain").InventoryItem): InventoryItemDto {
  const snapshot = inventoryItem.toSnapshot();

  return {
    id: snapshot.id,
    tenantId: snapshot.tenantId,
    productId: snapshot.productId,
    availableQuantity: snapshot.availableQuantity
  };
}
