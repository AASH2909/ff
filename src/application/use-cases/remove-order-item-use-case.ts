import { DomainError } from "@/domain";
import type {
  RemoveOrderItemInputDto,
  RemoveOrderItemOutputDto
} from "@/application/dtos/order-dtos";
import { toOrderDto } from "@/application/dtos/order-dtos";
import type { OrderRepository } from "@/application/repositories/order-repository";
import { fail, ok, type Result } from "@/application/result";

export type RemoveOrderItemUseCaseDependencies = {
  orderRepository: OrderRepository;
};

export class RemoveOrderItemUseCase {
  constructor(private readonly dependencies: RemoveOrderItemUseCaseDependencies) {}

  async execute(input: RemoveOrderItemInputDto): Promise<Result<RemoveOrderItemOutputDto>> {
    try {
      const order = await this.dependencies.orderRepository.findById(input.tenantId, input.orderId);

      if (!order) {
        return fail("NOT_FOUND", "Order was not found.");
      }

      order.removeItem(input.productId, input.quantity);

      await this.dependencies.orderRepository.save(order);

      return ok({
        order: toOrderDto(order)
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return fail("BUSINESS_RULE_VIOLATION", error.message);
      }

      return fail("PERSISTENCE_ERROR", "Unable to remove item from order.");
    }
  }
}
