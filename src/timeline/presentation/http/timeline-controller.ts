import type { NextRequest } from "next/server";
import type {
  GetLatestTimelineUseCase,
  GetTimelineEntryUseCase,
  GetTimelineGraphUseCase,
  GetTimelineUseCase,
  TimelineByIdQueryDto,
  TimelineQueryDto,
  TimelineScopeDto
} from "@/timeline/application";
import { jsonResult } from "@/timeline/presentation/http/api-response";

export type TimelineControllerDependencies = {
  getTimelineUseCase: GetTimelineUseCase;
  getLatestTimelineUseCase: GetLatestTimelineUseCase;
  getTimelineEntryUseCase: GetTimelineEntryUseCase;
  getTimelineGraphUseCase: GetTimelineGraphUseCase;
};

export class TimelineController {
  constructor(private readonly dependencies: TimelineControllerDependencies) {}

  async getTimeline(request: NextRequest) {
    return jsonResult(await this.dependencies.getTimelineUseCase.execute(this.getQuery(request)));
  }

  async getLatestTimeline(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getLatestTimelineUseCase.execute(this.getQuery(request))
    );
  }

  async getTimelineEntry(request: NextRequest, id: string) {
    return jsonResult(
      await this.dependencies.getTimelineEntryUseCase.execute(this.getByIdQuery(request, id))
    );
  }

  async getTimelineGraph(request: NextRequest, id: string) {
    return jsonResult(
      await this.dependencies.getTimelineGraphUseCase.execute(this.getByIdQuery(request, id))
    );
  }

  private getScope(request: NextRequest): TimelineScopeDto {
    const url = new URL(request.url);

    return {
      tenantId: request.headers.get("x-tenant-id") ?? url.searchParams.get("tenantId") ?? "",
      businessUnitId:
        request.headers.get("x-business-unit-id") ??
        url.searchParams.get("businessUnitId") ??
        undefined
    };
  }

  private getQuery(request: NextRequest): TimelineQueryDto {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    return {
      ...this.getScope(request),
      limit: limit === null ? undefined : Number(limit)
    };
  }

  private getByIdQuery(request: NextRequest, id: string): TimelineByIdQueryDto {
    return {
      ...this.getScope(request),
      id
    };
  }
}
