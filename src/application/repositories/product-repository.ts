import type { Product } from "@/domain";

export interface ProductRepository {
  findById(tenantId: string, productId: string): Promise<Product | null>;
}
