import type { Incident, IncidentSeverity, NotificationLifecycleStatus } from "@/notification/domain";

export type NotificationReadScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type IncidentQuery = NotificationReadScope & {
  status?: NotificationLifecycleStatus;
  severity?: IncidentSeverity;
  category?: string;
  limit: number;
};

export type IncidentSourceReference = {
  tenantId: string;
  sourceEvent: string;
  sourceEventId: string;
};

export interface IncidentRepository {
  save(incident: Incident): Promise<void>;
  findById(scope: NotificationReadScope, id: string): Promise<Incident | null>;
  findBySource(reference: IncidentSourceReference): Promise<Incident | null>;
  findMany(query: IncidentQuery): Promise<Incident[]>;
  update(incident: Incident): Promise<void>;
}
