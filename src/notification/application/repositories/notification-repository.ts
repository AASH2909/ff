import type {
  Notification,
  NotificationChannel,
  NotificationLifecycleStatus
} from "@/notification/domain";
import type { NotificationReadScope } from "@/notification/application/repositories/incident-repository";

export type NotificationQuery = NotificationReadScope & {
  status?: NotificationLifecycleStatus;
  channel?: NotificationChannel;
  incidentId?: string;
  limit: number;
};

export interface NotificationRepository {
  saveMany(notifications: Notification[]): Promise<void>;
  findMany(query: NotificationQuery): Promise<Notification[]>;
  findByIncident(scope: NotificationReadScope, incidentId: string): Promise<Notification[]>;
  updateMany(notifications: Notification[]): Promise<void>;
}
