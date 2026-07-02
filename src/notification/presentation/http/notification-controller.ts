import type { NextRequest } from "next/server";
import type {
  AcknowledgeIncidentUseCase,
  GetIncidentByIdUseCase,
  GetIncidentsUseCase,
  GetNotificationsUseCase,
  IncidentByIdQueryDto,
  IncidentLifecycleCommandDto,
  IncidentQueryDto,
  NotificationQueryDto,
  NotificationScopeDto,
  ResolveIncidentUseCase
} from "@/notification/application";
import { jsonResult } from "@/notification/presentation/http/api-response";

export type NotificationControllerDependencies = {
  getIncidentsUseCase: GetIncidentsUseCase;
  getIncidentByIdUseCase: GetIncidentByIdUseCase;
  acknowledgeIncidentUseCase: AcknowledgeIncidentUseCase;
  resolveIncidentUseCase: ResolveIncidentUseCase;
  getNotificationsUseCase: GetNotificationsUseCase;
};

export class NotificationController {
  constructor(private readonly dependencies: NotificationControllerDependencies) {}

  async getIncidents(request: NextRequest) {
    return jsonResult(await this.dependencies.getIncidentsUseCase.execute(this.getIncidentQuery(request)));
  }

  async getIncidentById(request: NextRequest, id: string) {
    return jsonResult(
      await this.dependencies.getIncidentByIdUseCase.execute(this.getIncidentByIdQuery(request, id))
    );
  }

  async acknowledgeIncident(request: NextRequest, id: string) {
    return jsonResult(
      await this.dependencies.acknowledgeIncidentUseCase.execute(
        this.getIncidentLifecycleCommand(request, id)
      )
    );
  }

  async resolveIncident(request: NextRequest, id: string) {
    return jsonResult(
      await this.dependencies.resolveIncidentUseCase.execute(
        this.getIncidentLifecycleCommand(request, id)
      )
    );
  }

  async getNotifications(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getNotificationsUseCase.execute(this.getNotificationQuery(request))
    );
  }

  private getScope(request: NextRequest): NotificationScopeDto {
    const url = new URL(request.url);

    return {
      tenantId: request.headers.get("x-tenant-id") ?? url.searchParams.get("tenantId") ?? "",
      businessUnitId:
        request.headers.get("x-business-unit-id") ??
        url.searchParams.get("businessUnitId") ??
        undefined
    };
  }

  private getIncidentQuery(request: NextRequest): IncidentQueryDto {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    return {
      ...this.getScope(request),
      status: url.searchParams.get("status") ?? undefined,
      severity: url.searchParams.get("severity") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      limit: limit === null ? undefined : Number(limit)
    };
  }

  private getIncidentByIdQuery(request: NextRequest, id: string): IncidentByIdQueryDto {
    return {
      ...this.getScope(request),
      id
    };
  }

  private getIncidentLifecycleCommand(
    request: NextRequest,
    id: string
  ): IncidentLifecycleCommandDto {
    return {
      ...this.getScope(request),
      id
    };
  }

  private getNotificationQuery(request: NextRequest): NotificationQueryDto {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    return {
      ...this.getScope(request),
      status: url.searchParams.get("status") ?? undefined,
      channel: url.searchParams.get("channel") ?? undefined,
      incidentId: url.searchParams.get("incidentId") ?? undefined,
      limit: limit === null ? undefined : Number(limit)
    };
  }
}
