import { DomainError } from "@/domain";
import { Money } from "@/domain/value-objects/money";
import type { ShiftRepository } from "@/application/repositories/shift-repository";
import type { CloseShiftInputDto, CloseShiftOutputDto } from "@/application/dtos/shift-dtos";
import { toShiftDto } from "@/application/dtos/shift-dtos";
import { fail, ok, type Result } from "@/application/result";

export type CloseShiftUseCaseDependencies = {
  shiftRepository: ShiftRepository;
};

export class CloseShiftUseCase {
  constructor(private readonly dependencies: CloseShiftUseCaseDependencies) {}

  async execute(input: CloseShiftInputDto): Promise<Result<CloseShiftOutputDto>> {
    try {
      const shift = await this.dependencies.shiftRepository.findById(input.tenantId, input.shiftId);

      if (!shift) {
        return fail("NOT_FOUND", "Shift was not found.");
      }

      shift.close(Money.fromMinor(input.closingCash.amount, input.closingCash.currency));

      await this.dependencies.shiftRepository.save(input.tenantId, shift);

      return ok({
        shift: toShiftDto(shift)
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return fail("BUSINESS_RULE_VIOLATION", error.message);
      }

      return fail("PERSISTENCE_ERROR", "Unable to close shift.");
    }
  }
}
