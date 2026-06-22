import { DomainError, Order } from "@/domain";
import type { IdGenerator } from "@/application/ports/id-generator";
import type { OrderRepository } from "@/application/repositories/order-repository";
import type { CreateOrderInputDto, CreateOrderOutputDto } from "@/application/dtos/order-dtos";
import { toOrderDto } from "@/application/dtos/order-dtos";
import { fail, ok, type Result } from "@/application/result";

export type CreateOrderUseCaseDependencies = {
  orderRepository: OrderRepository;
  idGenerator: IdGenerator;
};

export class CreateOrderUseCase {
  constructor(private readonly dependencies: CreateOrderUseCaseDependencies) {}

  async execute(input: CreateOrderInputDto): Promise<Result<CreateOrderOutputDto>> {
    try {
      const order = new Order({
        id: this.dependencies.idGenerator.nextId(),
        currency: input.currency ?? "USD"
      });

      await this.dependencies.orderRepository.save(input.tenantId, order);

      return ok({
        order: toOrderDto(order)
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return fail("BUSINESS_RULE_VIOLATION", error.message);
      }

      return fail("PERSISTENCE_ERROR", "Unable to create order.");
    }
  }
}
