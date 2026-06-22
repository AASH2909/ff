import { DomainError } from "@/domain";
import type { AddOrderItemInputDto, AddOrderItemOutputDto } from "@/application/dtos/order-dtos";
import { toOrderDto } from "@/application/dtos/order-dtos";
import type { OrderRepository } from "@/application/repositories/order-repository";
import type { ProductRepository } from "@/application/repositories/product-repository";
import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases/use-case";
import { validatePositiveInteger, validateRequiredStrings } from "@/application/validation";

export type AddOrderItemUseCaseDependencies = {
  orderRepository: OrderRepository;
  productRepository: ProductRepository;
};

export class AddOrderItemUseCase implements UseCase<AddOrderItemInputDto, AddOrderItemOutputDto> {
  constructor(private readonly dependencies: AddOrderItemUseCaseDependencies) {}

  async execute(input: AddOrderItemInputDto): Promise<Result<AddOrderItemOutputDto>> {
    try {
      const validationError = validateRequiredStrings([
        { value: input?.tenantId, label: "Tenant id" },
        { value: input?.orderId, label: "Order id" },
        { value: input?.productId, label: "Product id" }
      ]) ?? validatePositiveInteger(input?.quantity, "Quantity");

      if (validationError) {
        return fail(validationError.code, validationError.message);
      }

      const tenantId = input.tenantId.trim();
      const orderId = input.orderId.trim();
      const productId = input.productId.trim();
      const order = await this.dependencies.orderRepository.findById(tenantId, orderId);

      if (!order) {
        return fail("NOT_FOUND", "Order was not found.");
      }

      const product = await this.dependencies.productRepository.findById(tenantId, productId);

      if (!product) {
        return fail("NOT_FOUND", "Product was not found.");
      }

      order.addItem(product, input.quantity ?? 1);

      await this.dependencies.orderRepository.save(tenantId, order);

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
