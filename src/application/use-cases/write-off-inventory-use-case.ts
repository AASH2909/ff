import { DomainError } from "@/domain";
import type { InventoryRepository } from "@/application/repositories/inventory-repository";
import type { WriteOffInventoryInputDto, WriteOffInventoryOutputDto } from "@/application/dtos/inventory-dtos";
import { toInventoryItemDto } from "@/application/dtos/inventory-dtos";
import { fail, ok, type Result } from "@/application/result";

export type WriteOffInventoryUseCaseDependencies = {
  inventoryRepository: InventoryRepository;
};

export class WriteOffInventoryUseCase {
  constructor(private readonly dependencies: WriteOffInventoryUseCaseDependencies) {}

  async execute(input: WriteOffInventoryInputDto): Promise<Result<WriteOffInventoryOutputDto>> {
    try {
      const inventoryItem = await this.dependencies.inventoryRepository.findByProductId(
        input.tenantId,
        input.productId
      );

      if (!inventoryItem) {
        return fail("NOT_FOUND", "Inventory item was not found.");
      }

      inventoryItem.writeOff(input.quantity);

      await this.dependencies.inventoryRepository.save(input.tenantId, inventoryItem);

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
