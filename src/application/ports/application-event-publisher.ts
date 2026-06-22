import type { EventName, EventPayloadMap } from "@/events/contracts";

export type ApplicationEvent<TName extends EventName = EventName> = {
  eventName: TName;
  tenantId: string;
  aggregateId: string;
  occurredAt: string;
  correlationId?: string;
  causationId?: string;
  payload: EventPayloadMap[TName];
};

export interface ApplicationEventPublisher {
  publish<TName extends EventName>(event: ApplicationEvent<TName>): Promise<void>;
  publishAll(events: ApplicationEvent[]): Promise<void>;
}

export const noopApplicationEventPublisher: ApplicationEventPublisher = {
  publish: async () => {},
  publishAll: async () => {}
};
