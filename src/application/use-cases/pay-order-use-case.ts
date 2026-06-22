import { DomainError } from "@/domain";
import type { ApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import { noopApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { OrderRepository } from "@/application/repositories/order-repository";
import type { PayOrderInputDto, PayOrderOutputDto } from "@/application/dtos/order-dtos";
import { toOrderDto } from "@/application/dtos/order-dtos";
import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases/use-case";
import { validatePaymentMethod, validateRequiredStrings } from "@/application/validation";

export type PayOrderUseCaseDependencies = {
  orderRepository: OrderRepository;
  clock?: Clock;
  eventPublisher?: ApplicationEventPublisher;
};

export class PayOrderUseCase implements UseCase<PayOrderInputDto, PayOrderOutputDto> {
  private readonly clock: Clock;
  private readonly eventPublisher: ApplicationEventPublisher;

  constructor(private readonly dependencies: PayOrderUseCaseDependencies) {
    this.clock = dependencies.clock ?? systemClock;
    this.eventPublisher = dependencies.eventPublisher ?? noopApplicationEventPublisher;
  }

  async execute(input: PayOrderInputDto): Promise<Result<PayOrderOutputDto>> {
    try {
      const validationError =
        validateRequiredStrings([
          { value: input?.tenantId, label: "Tenant id" },
          { value: input?.orderId, label: "Order id" },
          { value: input?.paymentMethod, label: "Payment method" }
        ]) ?? validatePaymentMethod(input?.paymentMethod);

      if (validationError) {
        return fail(validationError.code, validationError.message);
      }

      const tenantId = input.tenantId.trim();
      const orderId = input.orderId.trim();
      const order = await this.dependencies.orderRepository.findById(
        tenantId,
        orderId
      );

      if (!order) {
        return fail("NOT_FOUND", "Order was not found.");
      }

      const paidAt = this.clock.now();
      order.markPaid(input.paymentMethod, paidAt);

      await this.dependencies.orderRepository.save(tenantId, order);
      await this.eventPublisher.publish({
        eventName: "OrderPaid",
        tenantId,
        aggregateId: order.id,
        occurredAt: paidAt.toISOString(),
        correlationId: input.correlationId,
        causationId: input.causationId,
        payload: {
          orderId: order.id,
          tenantId,
          amount: {
            amount: order.total.amount,
            currency: order.total.currency
          },
          paymentMethod: input.paymentMethod,
          paidAt: paidAt.toISOString()
        }
      });

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
