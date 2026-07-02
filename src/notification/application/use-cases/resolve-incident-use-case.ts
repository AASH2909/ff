import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  IncidentLifecycleCommandDto,
  IncidentOutputDto
} from "@/notification/application/dtos";
import { toIncidentDto } from "@/notification/application/dtos";
import type {
  IncidentRepository,
  NotificationRepository
} from "@/notification/application/repositories";
import { validateIncidentByIdQuery } from "@/notification/application/validation";
import {
  getNotificationClock,
  mapUnexpectedNotificationError,
  type NotificationUseCaseCommonDependencies
} from "@/notification/application/use-cases/notification-use-case-helpers";

export type ResolveIncidentUseCaseDependencies = NotificationUseCaseCommonDependencies & {
  incidentRepository: IncidentRepository;
  notificationRepository: NotificationRepository;
};

export class ResolveIncidentUseCase
  implements UseCase<IncidentLifecycleCommandDto, IncidentOutputDto>
{
  constructor(private readonly dependencies: ResolveIncidentUseCaseDependencies) {}

  async execute(input: IncidentLifecycleCommandDto): Promise<Result<IncidentOutputDto>> {
    const validation = validateIncidentByIdQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid incident resolution command."
      );
    }

    try {
      const { tenantId, businessUnitId, id } = validation.value;
      const scope = { tenantId, businessUnitId };
      const incident = await this.dependencies.incidentRepository.findById(scope, id);

      if (!incident) {
        return fail("NOT_FOUND", "Incident was not found.");
      }

      const resolvedAt = getNotificationClock(this.dependencies).now();
      const resolvedIncident = incident.resolve(resolvedAt);
      const notifications = await this.dependencies.notificationRepository.findByIncident(scope, id);

      await this.dependencies.incidentRepository.update(resolvedIncident);
      await this.dependencies.notificationRepository.updateMany(
        notifications.map((notification) => notification.resolve())
      );

      return ok({
        incident: toIncidentDto(resolvedIncident)
      });
    } catch (error) {
      const mappedError = mapUnexpectedNotificationError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
