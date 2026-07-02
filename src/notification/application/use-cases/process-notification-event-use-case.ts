import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type { DomainEvent, EventName } from "@/events";
import type { ProcessNotificationEventOutputDto } from "@/notification/application/dtos";
import { toIncidentDto, toNotificationDto } from "@/notification/application/dtos";
import type {
  IncidentRepository,
  NotificationRepository
} from "@/notification/application/repositories";
import {
  InternalNotificationPolicy,
  NotificationEventMapper
} from "@/notification/domain";
import {
  getNotificationClock,
  getNotificationIdGenerator,
  mapUnexpectedNotificationError,
  type NotificationUseCaseCommonDependencies
} from "@/notification/application/use-cases/notification-use-case-helpers";

export type ProcessNotificationEventUseCaseDependencies =
  NotificationUseCaseCommonDependencies & {
    incidentRepository: IncidentRepository;
    notificationRepository: NotificationRepository;
    eventMapper?: NotificationEventMapper;
    notificationPolicy?: InternalNotificationPolicy;
  };

export class ProcessNotificationEventUseCase
  implements UseCase<DomainEvent<EventName>, ProcessNotificationEventOutputDto>
{
  constructor(private readonly dependencies: ProcessNotificationEventUseCaseDependencies) {}

  async execute(
    event: DomainEvent<EventName>
  ): Promise<Result<ProcessNotificationEventOutputDto>> {
    try {
      const existingIncident = await this.dependencies.incidentRepository.findBySource({
        tenantId: event.tenantId,
        sourceEvent: event.eventName,
        sourceEventId: event.eventId
      });

      if (existingIncident) {
        return ok({
          incident: toIncidentDto(existingIncident),
          notifications: [],
          duplicate: true
        });
      }

      const idGenerator = getNotificationIdGenerator(this.dependencies);
      const occurredAt = getNotificationClock(this.dependencies).now();
      const incident = (this.dependencies.eventMapper ?? new NotificationEventMapper()).map({
        event,
        incidentId: idGenerator.nextId(),
        occurredAt
      });
      const notifications = (
        this.dependencies.notificationPolicy ?? new InternalNotificationPolicy()
      ).createNotifications({
        incident,
        idGenerator,
        createdAt: occurredAt
      });

      await this.dependencies.incidentRepository.save(incident);
      await this.dependencies.notificationRepository.saveMany(notifications);

      return ok({
        incident: toIncidentDto(incident),
        notifications: notifications.map(toNotificationDto),
        duplicate: false
      });
    } catch (error) {
      const mappedError = mapUnexpectedNotificationError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
