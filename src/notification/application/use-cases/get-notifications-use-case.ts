import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  NotificationQueryDto,
  NotificationsOutputDto
} from "@/notification/application/dtos";
import { toNotificationDto } from "@/notification/application/dtos";
import type { NotificationRepository } from "@/notification/application/repositories";
import { validateNotificationQuery } from "@/notification/application/validation";
import { mapUnexpectedNotificationError } from "@/notification/application/use-cases/notification-use-case-helpers";

export type GetNotificationsUseCaseDependencies = {
  notificationRepository: NotificationRepository;
};

export class GetNotificationsUseCase
  implements UseCase<NotificationQueryDto, NotificationsOutputDto>
{
  constructor(private readonly dependencies: GetNotificationsUseCaseDependencies) {}

  async execute(input: NotificationQueryDto): Promise<Result<NotificationsOutputDto>> {
    const validation = validateNotificationQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid notification query."
      );
    }

    try {
      const notifications = await this.dependencies.notificationRepository.findMany(
        validation.value
      );

      return ok({
        notifications: notifications.map(toNotificationDto)
      });
    } catch (error) {
      const mappedError = mapUnexpectedNotificationError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
