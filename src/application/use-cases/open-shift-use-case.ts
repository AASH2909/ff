import { DomainError, Shift } from "@/domain";
import { moneyFromDto } from "@/application/dtos/common-dtos";
import type { ApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import { noopApplicationEventPublisher } from "@/application/ports/application-event-publisher";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { IdGenerator } from "@/application/ports/id-generator";
import type { ShiftRepository } from "@/application/repositories/shift-repository";
import type { OpenShiftInputDto, OpenShiftOutputDto } from "@/application/dtos/shift-dtos";
import { toShiftDto } from "@/application/dtos/shift-dtos";
import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases/use-case";
import {
  validateMoneyDto,
  validateRequiredStrings,
  validateTenantMatch
} from "@/application/validation";

export type OpenShiftUseCaseDependencies = {
  shiftRepository: ShiftRepository;
  idGenerator: IdGenerator;
  clock?: Clock;
  eventPublisher?: ApplicationEventPublisher;
};

export class OpenShiftUseCase implements UseCase<OpenShiftInputDto, OpenShiftOutputDto> {
  private readonly clock: Clock;
  private readonly eventPublisher: ApplicationEventPublisher;

  constructor(private readonly dependencies: OpenShiftUseCaseDependencies) {
    this.clock = dependencies.clock ?? systemClock;
    this.eventPublisher = dependencies.eventPublisher ?? noopApplicationEventPublisher;
  }

  async execute(input: OpenShiftInputDto): Promise<Result<OpenShiftOutputDto>> {
    try {
      const validationError =
        validateRequiredStrings([
          { value: input?.tenantId, label: "Tenant id" },
          { value: input?.cashierId, label: "Cashier id" }
        ]) ?? validateMoneyDto(input?.openingCash, "Opening cash");

      if (validationError) {
        return fail(validationError.code, validationError.message);
      }

      const tenantId = input.tenantId.trim();
      const cashierId = input.cashierId.trim();
      const existingOpenShift = await this.dependencies.shiftRepository.findOpenShift(
        tenantId,
        cashierId
      );

      if (existingOpenShift) {
        const tenantMatchError = validateTenantMatch(
          existingOpenShift.tenantId,
          tenantId,
          "Shift"
        );

        if (tenantMatchError) {
          return fail(tenantMatchError.code, tenantMatchError.message);
        }

        return fail("BUSINESS_RULE_VIOLATION", "A shift is already open for this cashier.");
      }

      const openedAt = this.clock.now();
      const shift = new Shift({
        id: this.dependencies.idGenerator.nextId(),
        tenantId,
        cashierId,
        openingCash: moneyFromDto(input.openingCash),
        openedAt
      });

      await this.dependencies.shiftRepository.save(tenantId, shift);
      await this.eventPublisher.publish({
        eventName: "ShiftOpened",
        tenantId,
        aggregateId: shift.id,
        occurredAt: openedAt.toISOString(),
        correlationId: input.correlationId,
        causationId: input.causationId,
        payload: {
          shiftId: shift.id,
          tenantId,
          cashierId,
          openingCash: input.openingCash,
          openedAt: openedAt.toISOString()
        }
      });

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
