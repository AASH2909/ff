import { DomainError } from "@/domain";
import type { ApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import { noopApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { CancelOrderInputDto, CancelOrderOutputDto } from "@/application/dtos/order-dtos";
import { toOrderDto } from "@/application/dtos/order-dtos";
import type { OrderRepository } from "@/application/repositories/order-repository";
import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases/use-case";
import { validateRequiredStrings } from "@/application/validation";

export type CancelOrderUseCaseDependencies = {
  orderRepository: OrderRepository;
  clock?: Clock;
  eventPublisher?: ApplicationEventPublisher;
};

export class CancelOrderUseCase implements UseCase<CancelOrderInputDto, CancelOrderOutputDto> {
  private readonly clock: Clock;
  private readonly eventPublisher: ApplicationEventPublisher;

  constructor(private readonly dependencies: CancelOrderUseCaseDependencies) {
    this.clock = dependencies.clock ?? systemClock;
    this.eventPublisher = dependencies.eventPublisher ?? noopApplicationEventPublisher;
  }

  async execute(input: CancelOrderInputDto): Promise<Result<CancelOrderOutputDto>> {
    try {
      const validationError = validateRequiredStrings([
        { value: input?.tenantId, label: "Tenant id" },
        { value: input?.orderId, label: "Order id" }
      ]);

      if (validationError) {
        return fail(validationError.code, validationError.message);
      }

      const tenantId = input.tenantId.trim();
      const orderId = input.orderId.trim();
      const order = await this.dependencies.orderRepository.findById(tenantId, orderId);

      if (!order) {
        return fail("NOT_FOUND", "Order was not found.");
      }

      const cancelledAt = this.clock.now();
      order.cancel(cancelledAt);

      await this.dependencies.orderRepository.save(tenantId, order);
      await this.eventPublisher.publish({
        eventName: "OrderCancelled",
        tenantId,
        aggregateId: order.id,
        occurredAt: cancelledAt.toISOString(),
        correlationId: input.correlationId,
        causationId: input.causationId,
        payload: {
          orderId: order.id,
          tenantId,
          cancelledAt: cancelledAt.toISOString(),
          reason: input.reason
        }
      });

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
