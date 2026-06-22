import { DomainError, InventoryItem } from "@/domain";
import type { IdGenerator } from "@/application/ports/id-generator";
import type { InventoryRepository } from "@/application/repositories/inventory-repository";
import type { ReceiveInventoryInputDto, ReceiveInventoryOutputDto } from "@/application/dtos/inventory-dtos";
import { toInventoryItemDto } from "@/application/dtos/inventory-dtos";
import { fail, ok, type Result } from "@/application/result";

export type ReceiveInventoryUseCaseDependencies = {
  inventoryRepository: InventoryRepository;
  idGenerator: IdGenerator;
};

export class ReceiveInventoryUseCase {
  constructor(private readonly dependencies: ReceiveInventoryUseCaseDependencies) {}

  async execute(input: ReceiveInventoryInputDto): Promise<Result<ReceiveInventoryOutputDto>> {
    try {
      let inventoryItem = await this.dependencies.inventoryRepository.findByProductId(
        input.tenantId,
        input.productId
      );

      if (!inventoryItem) {
        inventoryItem = new InventoryItem({
          id: this.dependencies.idGenerator.nextId(),
          tenantId: input.tenantId,
          productId: input.productId,
          availableQuantity: 0
        });
      }

      inventoryItem.receive(input.quantity);

      await this.dependencies.inventoryRepository.save(input.tenantId, inventoryItem);

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
