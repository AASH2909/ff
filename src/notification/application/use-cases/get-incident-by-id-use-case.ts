import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type { IncidentByIdQueryDto, IncidentOutputDto } from "@/notification/application/dtos";
import { toIncidentDto } from "@/notification/application/dtos";
import type { IncidentRepository } from "@/notification/application/repositories";
import { validateIncidentByIdQuery } from "@/notification/application/validation";
import { mapUnexpectedNotificationError } from "@/notification/application/use-cases/notification-use-case-helpers";

export type GetIncidentByIdUseCaseDependencies = {
  incidentRepository: IncidentRepository;
};

export class GetIncidentByIdUseCase
  implements UseCase<IncidentByIdQueryDto, IncidentOutputDto>
{
  constructor(private readonly dependencies: GetIncidentByIdUseCaseDependencies) {}

  async execute(input: IncidentByIdQueryDto): Promise<Result<IncidentOutputDto>> {
    const validation = validateIncidentByIdQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid incident id query."
      );
    }

    try {
      const { tenantId, businessUnitId, id } = validation.value;
      const incident = await this.dependencies.incidentRepository.findById(
        { tenantId, businessUnitId },
        id
      );

      if (!incident) {
        return fail("NOT_FOUND", "Incident was not found.");
      }

      return ok({
        incident: toIncidentDto(incident)
      });
    } catch (error) {
      const mappedError = mapUnexpectedNotificationError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
