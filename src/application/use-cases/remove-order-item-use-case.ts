import { DomainError } from "@/domain";
import type {
  RemoveOrderItemInputDto,
  RemoveOrderItemOutputDto
} from "@/application/dtos/order-dtos";
import { toOrderDto } from "@/application/dtos/order-dtos";
import type { OrderRepository } from "@/application/repositories/order-repository";
import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases/use-case";
import { validatePositiveInteger, validateRequiredStrings } from "@/application/validation";

export type RemoveOrderItemUseCaseDependencies = {
  orderRepository: OrderRepository;
};

export class RemoveOrderItemUseCase
  implements UseCase<RemoveOrderItemInputDto, RemoveOrderItemOutputDto>
{
  constructor(private readonly dependencies: RemoveOrderItemUseCaseDependencies) {}

  async execute(input: RemoveOrderItemInputDto): Promise<Result<RemoveOrderItemOutputDto>> {
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

      order.removeItem(productId, input.quantity);

      await this.dependencies.orderRepository.save(tenantId, order);

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
