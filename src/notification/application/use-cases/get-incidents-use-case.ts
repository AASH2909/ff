import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type { IncidentQueryDto, IncidentsOutputDto } from "@/notification/application/dtos";
import { toIncidentDto } from "@/notification/application/dtos";
import type { IncidentRepository } from "@/notification/application/repositories";
import { validateIncidentQuery } from "@/notification/application/validation";
import { mapUnexpectedNotificationError } from "@/notification/application/use-cases/notification-use-case-helpers";

export type GetIncidentsUseCaseDependencies = {
  incidentRepository: IncidentRepository;
};

export class GetIncidentsUseCase implements UseCase<IncidentQueryDto, IncidentsOutputDto> {
  constructor(private readonly dependencies: GetIncidentsUseCaseDependencies) {}

  async execute(input: IncidentQueryDto): Promise<Result<IncidentsOutputDto>> {
    const validation = validateIncidentQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid incident query."
      );
    }

    try {
      const incidents = await this.dependencies.incidentRepository.findMany(validation.value);

      return ok({
        incidents: incidents.map(toIncidentDto)
      });
    } catch (error) {
      const mappedError = mapUnexpectedNotificationError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
