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

export type AcknowledgeIncidentUseCaseDependencies =
  NotificationUseCaseCommonDependencies & {
    incidentRepository: IncidentRepository;
    notificationRepository: NotificationRepository;
  };

export class AcknowledgeIncidentUseCase
  implements UseCase<IncidentLifecycleCommandDto, IncidentOutputDto>
{
  constructor(private readonly dependencies: AcknowledgeIncidentUseCaseDependencies) {}

  async execute(input: IncidentLifecycleCommandDto): Promise<Result<IncidentOutputDto>> {
    const validation = validateIncidentByIdQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid incident acknowledgement command."
      );
    }

    try {
      const { tenantId, businessUnitId, id } = validation.value;
      const scope = { tenantId, businessUnitId };
      const incident = await this.dependencies.incidentRepository.findById(scope, id);

      if (!incident) {
        return fail("NOT_FOUND", "Incident was not found.");
      }

      if (incident.status === "RESOLVED") {
        return fail("BUSINESS_RULE_VIOLATION", "Resolved incidents cannot be acknowledged.");
      }

      const acknowledgedAt = getNotificationClock(this.dependencies).now();
      const acknowledgedIncident = incident.acknowledge(acknowledgedAt);
      const notifications = await this.dependencies.notificationRepository.findByIncident(scope, id);

      await this.dependencies.incidentRepository.update(acknowledgedIncident);
      await this.dependencies.notificationRepository.updateMany(
        notifications
          .filter((notification) => notification.status !== "RESOLVED")
          .map((notification) => notification.acknowledge(acknowledgedAt))
      );

      return ok({
        incident: toIncidentDto(acknowledgedIncident)
      });
    } catch (error) {
      const mappedError = mapUnexpectedNotificationError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
