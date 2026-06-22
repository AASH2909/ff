import { DomainError } from "@/domain";
import type { AddOrderItemInputDto, AddOrderItemOutputDto } from "@/application/dtos/order-dtos";
import { toOrderDto } from "@/application/dtos/order-dtos";
import type { OrderRepository } from "@/application/repositories/order-repository";
import type { ProductRepository } from "@/application/repositories/product-repository";
import { fail, ok, type Result } from "@/application/result";

export type AddOrderItemUseCaseDependencies = {
  orderRepository: OrderRepository;
  productRepository: ProductRepository;
};

export class AddOrderItemUseCase {
  constructor(private readonly dependencies: AddOrderItemUseCaseDependencies) {}

  async execute(input: AddOrderItemInputDto): Promise<Result<AddOrderItemOutputDto>> {
    try {
      const order = await this.dependencies.orderRepository.findById(input.tenantId, input.orderId);

      if (!order) {
        return fail("NOT_FOUND", "Order was not found.");
      }

      const product = await this.dependencies.productRepository.findById(input.tenantId, input.productId);

      if (!product) {
        return fail("NOT_FOUND", "Product was not found.");
      }

      order.addItem(product, input.quantity ?? 1);

      await this.dependencies.orderRepository.save(order);

      return ok({
        order: toOrderDto(order)
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return fail("BUSINESS_RULE_VIOLATION", error.message);
      }

      return fail("PERSISTENCE_ERROR", "Unable to add item to order.");
    }
  }
}
