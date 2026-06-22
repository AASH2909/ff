import type { InventoryItem } from "@/domain";

export interface InventoryRepository {
  findByProductId(tenantId: string, productId: string): Promise<InventoryItem | null>;
  save(tenantId: string, inventoryItem: InventoryItem): Promise<void>;
}
