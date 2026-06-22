import { DomainError, InventoryItem } from "@/domain";
import type { ApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import { noopApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { IdGenerator } from "@/application/ports/id-generator";
import type { InventoryRepository } from "@/application/repositories/inventory-repository";
import type {
  ReceiveInventoryInputDto,
  ReceiveInventoryOutputDto
} from "@/application/dtos/inventory-dtos";
import { toInventoryItemDto } from "@/application/dtos/inventory-dtos";
import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases/use-case";
import {
  validatePositiveInteger,
  validateRequiredStrings,
  validateTenantMatch
} from "@/application/validation";

export type ReceiveInventoryUseCaseDependencies = {
  inventoryRepository: InventoryRepository;
  idGenerator: IdGenerator;
  clock?: Clock;
  eventPublisher?: ApplicationEventPublisher;
};

export class ReceiveInventoryUseCase
  implements UseCase<ReceiveInventoryInputDto, ReceiveInventoryOutputDto>
{
  private readonly clock: Clock;
  private readonly eventPublisher: ApplicationEventPublisher;

  constructor(private readonly dependencies: ReceiveInventoryUseCaseDependencies) {
    this.clock = dependencies.clock ?? systemClock;
    this.eventPublisher = dependencies.eventPublisher ?? noopApplicationEventPublisher;
  }

  async execute(input: ReceiveInventoryInputDto): Promise<Result<ReceiveInventoryOutputDto>> {
    try {
      const validationError =
        validateRequiredStrings([
          { value: input?.tenantId, label: "Tenant id" },
          { value: input?.productId, label: "Product id" }
        ]) ?? validatePositiveInteger(input?.quantity, "Quantity", { required: true });

      if (validationError) {
        return fail(validationError.code, validationError.message);
      }

      const tenantId = input.tenantId.trim();
      const productId = input.productId.trim();
      let inventoryItem = await this.dependencies.inventoryRepository.findByProductId(
        tenantId,
        productId
      );

      if (!inventoryItem) {
        inventoryItem = new InventoryItem({
          id: this.dependencies.idGenerator.nextId(),
          tenantId,
          productId,
          availableQuantity: 0
        });
      } else {
        const tenantMatchError = validateTenantMatch(
          inventoryItem.tenantId,
          tenantId,
          "Inventory item"
        );

        if (tenantMatchError) {
          return fail(tenantMatchError.code, tenantMatchError.message);
        }
      }

      inventoryItem.receive(input.quantity);

      const receivedAt = this.clock.now();

      await this.dependencies.inventoryRepository.save(tenantId, inventoryItem);
      await this.eventPublisher.publish({
        eventName: "InventoryReceived",
        tenantId,
        aggregateId: inventoryItem.id,
        occurredAt: receivedAt.toISOString(),
        correlationId: input.correlationId,
        causationId: input.causationId,
        payload: {
          inventoryId: inventoryItem.id,
          tenantId,
          productId,
          quantity: input.quantity,
          receivedAt: receivedAt.toISOString()
        }
      });

      return ok({
        inventoryItem: toInventoryItemDto(inventoryItem)
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return fail("BUSINESS_RULE_VIOLATION", error.message);
      }

      return fail("PERSISTENCE_ERROR", "Unable to receive inventory.");
    }
  }
}
