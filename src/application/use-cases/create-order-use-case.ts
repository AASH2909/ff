import { DomainError, Order } from "@/domain";
import type { ApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import { noopApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { IdGenerator } from "@/application/ports/id-generator";
import type { OrderRepository } from "@/application/repositories/order-repository";
import type {
  CreateOrderInputDto,
  CreateOrderOutputDto
} from "@/application/dtos/order-dtos";
import { toOrderDto } from "@/application/dtos/order-dtos";
import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases/use-case";
import { validateCurrencyCode, validateRequiredStrings } from "@/application/validation";

export type CreateOrderUseCaseDependencies = {
  orderRepository: OrderRepository;
  idGenerator: IdGenerator;
  clock?: Clock;
  eventPublisher?: ApplicationEventPublisher;
};

export class CreateOrderUseCase implements UseCase<CreateOrderInputDto, CreateOrderOutputDto> {
  private readonly clock: Clock;
  private readonly eventPublisher: ApplicationEventPublisher;

  constructor(private readonly dependencies: CreateOrderUseCaseDependencies) {
    this.clock = dependencies.clock ?? systemClock;
    this.eventPublisher = dependencies.eventPublisher ?? noopApplicationEventPublisher;
  }

  async execute(input: CreateOrderInputDto): Promise<Result<CreateOrderOutputDto>> {
    try {
      const validationError =
        validateRequiredStrings([{ value: input?.tenantId, label: "Tenant id" }]) ??
        validateCurrencyCode(input?.currency);

      if (validationError) {
        return fail(validationError.code, validationError.message);
      }

      const tenantId = input.tenantId.trim();
      const createdAt = this.clock.now();
      const order = new Order({
        id: this.dependencies.idGenerator.nextId(),
        currency: input.currency ?? "USD",
        openedAt: createdAt
      });

      await this.dependencies.orderRepository.save(tenantId, order);
      await this.eventPublisher.publish({
        eventName: "OrderCreated",
        tenantId,
        aggregateId: order.id,
        occurredAt: createdAt.toISOString(),
        correlationId: input.correlationId,
        causationId: input.causationId,
        payload: {
          orderId: order.id,
          tenantId,
          status: order.status,
          total: {
            amount: order.total.amount,
            currency: order.total.currency
          },
          currency: order.total.currency,
          createdAt: createdAt.toISOString()
        }
      });

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
