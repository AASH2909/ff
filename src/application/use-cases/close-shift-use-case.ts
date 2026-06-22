import { DomainError } from "@/domain";
import { moneyFromDto } from "@/application/dtos/common-dtos";
import type { ApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import { noopApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { ShiftRepository } from "@/application/repositories/shift-repository";
import type { CloseShiftInputDto, CloseShiftOutputDto } from "@/application/dtos/shift-dtos";
import { toShiftDto } from "@/application/dtos/shift-dtos";
import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases/use-case";
import {
  validateMoneyDto,
  validateRequiredStrings,
  validateTenantMatch
} from "@/application/validation";

export type CloseShiftUseCaseDependencies = {
  shiftRepository: ShiftRepository;
  clock?: Clock;
  eventPublisher?: ApplicationEventPublisher;
};

export class CloseShiftUseCase implements UseCase<CloseShiftInputDto, CloseShiftOutputDto> {
  private readonly clock: Clock;
  private readonly eventPublisher: ApplicationEventPublisher;

  constructor(private readonly dependencies: CloseShiftUseCaseDependencies) {
    this.clock = dependencies.clock ?? systemClock;
    this.eventPublisher = dependencies.eventPublisher ?? noopApplicationEventPublisher;
  }

  async execute(input: CloseShiftInputDto): Promise<Result<CloseShiftOutputDto>> {
    try {
      const validationError =
        validateRequiredStrings([
          { value: input?.tenantId, label: "Tenant id" },
          { value: input?.shiftId, label: "Shift id" }
        ]) ?? validateMoneyDto(input?.closingCash, "Closing cash");

      if (validationError) {
        return fail(validationError.code, validationError.message);
      }

      const tenantId = input.tenantId.trim();
      const shiftId = input.shiftId.trim();
      const shift = await this.dependencies.shiftRepository.findById(tenantId, shiftId);

      if (!shift) {
        return fail("NOT_FOUND", "Shift was not found.");
      }

      const tenantMatchError = validateTenantMatch(shift.tenantId, tenantId, "Shift");

      if (tenantMatchError) {
        return fail(tenantMatchError.code, tenantMatchError.message);
      }

      const closedAt = this.clock.now();
      shift.close(moneyFromDto(input.closingCash), closedAt);

      await this.dependencies.shiftRepository.save(tenantId, shift);
      await this.eventPublisher.publish({
        eventName: "ShiftClosed",
        tenantId,
        aggregateId: shift.id,
        occurredAt: closedAt.toISOString(),
        correlationId: input.correlationId,
        causationId: input.causationId,
        payload: {
          shiftId: shift.id,
          tenantId,
          closingCash: input.closingCash,
          closedAt: closedAt.toISOString()
        }
      });

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
