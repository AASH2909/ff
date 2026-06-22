import { DomainError } from "@/domain";
import type { CancelOrderInputDto, CancelOrderOutputDto } from "@/application/dtos/order-dtos";
import { toOrderDto } from "@/application/dtos/order-dtos";
import type { OrderRepository } from "@/application/repositories/order-repository";
import { fail, ok, type Result } from "@/application/result";

export type CancelOrderUseCaseDependencies = {
  orderRepository: OrderRepository;
};

export class CancelOrderUseCase {
  constructor(private readonly dependencies: CancelOrderUseCaseDependencies) {}

  async execute(input: CancelOrderInputDto): Promise<Result<CancelOrderOutputDto>> {
    try {
      const order = await this.dependencies.orderRepository.findById(input.tenantId, input.orderId);

      if (!order) {
        return fail("NOT_FOUND", "Order was not found.");
      }

      order.cancel();

      await this.dependencies.orderRepository.save(input.tenantId, order);

      return ok({
        order: toOrderDto(order)
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return fail("BUSINESS_RULE_VIOLATION", error.message);
      }

      return fail("PERSISTENCE_ERROR", "Unable to cancel order.");
    }
  }
}
