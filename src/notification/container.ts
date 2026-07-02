import type { IdGenerator } from "@/application/ports/id-generator";
import type { EventBus, EventSubscription } from "@/events";
import { createClient } from "@/lib/supabase/server";
import {
  AcknowledgeIncidentUseCase,
  GetIncidentByIdUseCase,
  GetIncidentsUseCase,
  GetNotificationsUseCase,
  ProcessNotificationEventUseCase,
  ResolveIncidentUseCase
} from "@/notification/application";
import {
  InternalNotificationPolicy,
  NotificationEventMapper
} from "@/notification/domain";
import { NotificationEventSubscriber } from "@/notification/infrastructure/events";
import {
  SupabaseIncidentRepository,
  SupabaseNotificationRepository
} from "@/notification/infrastructure/supabase";
import { NotificationController } from "@/notification/presentation/http";

export type NotificationModule = {
  controller: NotificationController;
  eventSubscriber: NotificationEventSubscriber;
};

export async function createNotificationModule(): Promise<NotificationModule> {
  const supabase = await createClient();
  const incidentRepository = new SupabaseIncidentRepository(supabase);
  const notificationRepository = new SupabaseNotificationRepository(supabase);
  const lifecycleDependencies = {
    incidentRepository,
    notificationRepository
  };
  const processNotificationEventUseCase = new ProcessNotificationEventUseCase({
    ...lifecycleDependencies,
    idGenerator: uuidGenerator,
    eventMapper: new NotificationEventMapper(),
    notificationPolicy: new InternalNotificationPolicy()
  });

  return {
    controller: new NotificationController({
      getIncidentsUseCase: new GetIncidentsUseCase({ incidentRepository }),
      getIncidentByIdUseCase: new GetIncidentByIdUseCase({ incidentRepository }),
      acknowledgeIncidentUseCase: new AcknowledgeIncidentUseCase(lifecycleDependencies),
      resolveIncidentUseCase: new ResolveIncidentUseCase(lifecycleDependencies),
      getNotificationsUseCase: new GetNotificationsUseCase({ notificationRepository })
    }),
    eventSubscriber: new NotificationEventSubscriber(processNotificationEventUseCase)
  };
}

export async function registerNotificationEventHandlers(
  eventBus: EventBus
): Promise<EventSubscription[]> {
  const { eventSubscriber } = await createNotificationModule();
  return eventSubscriber.subscribe(eventBus);
}

const uuidGenerator: IdGenerator = {
  nextId: () => crypto.randomUUID()
};
