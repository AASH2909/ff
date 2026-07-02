import type { EventBus, EventName, EventSubscription } from "@/events";
import type { ProcessNotificationEventUseCase } from "@/notification/application";

export const NOTIFICATION_EVENT_NAMES = [
  "FraudDetected",
  "ControlScoreUpdated",
  "AISummaryGenerated"
] as const satisfies readonly EventName[];

export class NotificationEventSubscriber {
  constructor(private readonly processNotificationEventUseCase: ProcessNotificationEventUseCase) {}

  async subscribe(eventBus: EventBus): Promise<EventSubscription[]> {
    const subscriptions: EventSubscription[] = [];

    for (const eventName of NOTIFICATION_EVENT_NAMES) {
      subscriptions.push(
        await eventBus.subscribe(
          eventName,
          async (event) => {
            const result = await this.processNotificationEventUseCase.execute(event);

            if (!result.ok) {
              throw new Error(result.error.message);
            }
          },
          {
            queueGroup: "notification-center",
            durableName: `notification-center-${eventName}`,
            handlerName: `notification-center.${eventName}`
          }
        )
      );
    }

    return subscriptions;
  }
}
