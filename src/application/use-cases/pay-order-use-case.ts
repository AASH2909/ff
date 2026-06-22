import { DomainError } from "@/domain";
import type { OrderRepository } from "@/application/repositories/order-repository";
import type { PayOrderInputDto, PayOrderOutputDto } from "@/application/dtos/order-dtos";
import { toOrderDto } from "@/application/dtos/order-dtos";
import { fail, ok, type Result } from "@/application/result";

export type PayOrderUseCaseDependencies = {
  orderRepository: OrderRepository;
};

export class PayOrderUseCase {
  constructor(private readonly dependencies: PayOrderUseCaseDependencies) {}

  async execute(input: PayOrderInputDto): Promise<Result<PayOrderOutputDto>> {
    try {
      const order = await this.dependencies.orderRepository.findById(
        input.tenantId,
        input.orderId
      );

      if (!order) {
        return fail("NOT_FOUND", "Order was not found.");
      }

      order.markPaid(input.paymentMethod);

      await this.dependencies.orderRepository.save(input.tenantId, order);

      return ok({
        order: toOrderDto(order)
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return fail("BUSINESS_RULE_VIOLATION", error.message);
      }

      return fail("PERSISTENCE_ERROR", "Unable to pay order.");
    }
  }
}
