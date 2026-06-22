import { DomainError, Shift } from "@/domain";
import { Money } from "@/domain/value-objects/money";
import type { IdGenerator } from "@/application/ports/id-generator";
import type { ShiftRepository } from "@/application/repositories/shift-repository";
import type { OpenShiftInputDto, OpenShiftOutputDto } from "@/application/dtos/shift-dtos";
import { toShiftDto } from "@/application/dtos/shift-dtos";
import { fail, ok, type Result } from "@/application/result";

export type OpenShiftUseCaseDependencies = {
  shiftRepository: ShiftRepository;
  idGenerator: IdGenerator;
};

export class OpenShiftUseCase {
  constructor(private readonly dependencies: OpenShiftUseCaseDependencies) {}

  async execute(input: OpenShiftInputDto): Promise<Result<OpenShiftOutputDto>> {
    try {
      const existingOpenShift = await this.dependencies.shiftRepository.findOpenShift(
        input.tenantId,
        input.cashierId
      );

      if (existingOpenShift) {
        return fail("BUSINESS_RULE_VIOLATION", "A shift is already open for this cashier.");
      }

      const shift = new Shift({
        id: this.dependencies.idGenerator.nextId(),
        tenantId: input.tenantId,
        cashierId: input.cashierId,
        openingCash: Money.fromMinor(input.openingCash.amount, input.openingCash.currency)
      });

      await this.dependencies.shiftRepository.save(input.tenantId, shift);

      return ok({
        shift: toShiftDto(shift)
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return fail("BUSINESS_RULE_VIOLATION", error.message);
      }

      return fail("PERSISTENCE_ERROR", "Unable to open shift.");
    }
  }
}
