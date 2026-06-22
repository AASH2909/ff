import type { Order } from "@/domain";

export interface OrderRepository {
  findById(tenantId: string, orderId: string): Promise<Order | null>;
  save(tenantId: string, order: Order): Promise<void>;
}
