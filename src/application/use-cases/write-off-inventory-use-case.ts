import { DomainError } from "@/domain";
import type { ApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import { noopApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { InventoryRepository } from "@/application/repositories/inventory-repository";
import type {
  WriteOffInventoryInputDto,
  WriteOffInventoryOutputDto
} from "@/application/dtos/inventory-dtos";
import { toInventoryItemDto } from "@/application/dtos/inventory-dtos";
import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases/use-case";
import {
  validatePositiveInteger,
  validateRequiredStrings,
  validateTenantMatch
} from "@/application/validation";

export type WriteOffInventoryUseCaseDependencies = {
  inventoryRepository: InventoryRepository;
  clock?: Clock;
  eventPublisher?: ApplicationEventPublisher;
};

export class WriteOffInventoryUseCase
  implements UseCase<WriteOffInventoryInputDto, WriteOffInventoryOutputDto>
{
  private readonly clock: Clock;
  private readonly eventPublisher: ApplicationEventPublisher;

  constructor(private readonly dependencies: WriteOffInventoryUseCaseDependencies) {
    this.clock = dependencies.clock ?? systemClock;
    this.eventPublisher = dependencies.eventPublisher ?? noopApplicationEventPublisher;
  }

  async execute(input: WriteOffInventoryInputDto): Promise<Result<WriteOffInventoryOutputDto>> {
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
      const inventoryItem = await this.dependencies.inventoryRepository.findByProductId(
        tenantId,
        productId
      );

      if (!inventoryItem) {
        return fail("NOT_FOUND", "Inventory item was not found.");
      }

      const tenantMatchError = validateTenantMatch(
        inventoryItem.tenantId,
        tenantId,
        "Inventory item"
      );

      if (tenantMatchError) {
        return fail(tenantMatchError.code, tenantMatchError.message);
      }

      inventoryItem.writeOff(input.quantity);

      const writtenOffAt = this.clock.now();

      await this.dependencies.inventoryRepository.save(tenantId, inventoryItem);
      await this.eventPublisher.publish({
        eventName: "InventoryWrittenOff",
        tenantId,
        aggregateId: inventoryItem.id,
        occurredAt: writtenOffAt.toISOString(),
        correlationId: input.correlationId,
        causationId: input.causationId,
        payload: {
          inventoryId: inventoryItem.id,
          tenantId,
          productId,
          quantity: input.quantity,
          writtenOffAt: writtenOffAt.toISOString(),
          reason: input.reason
        }
      });

      return ok({
        inventoryItem: toInventoryItemDto(inventoryItem)
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return fail("BUSINESS_RULE_VIOLATION", error.message);
      }

      return fail("PERSISTENCE_ERROR", "Unable to write off inventory.");
    }
  }
}
