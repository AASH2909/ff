import type { NextRequest } from "next/server";
import type {
  AnalyticsContextQueryDto,
  GetAnalyticsContextUseCase,
  GetLatestAnalyticsContextUseCase
} from "@/analytics-context/application";
import { jsonResult } from "@/analytics-context/presentation/http/api-response";

export type AnalyticsContextControllerDependencies = {
  getAnalyticsContextUseCase: GetAnalyticsContextUseCase;
  getLatestAnalyticsContextUseCase: GetLatestAnalyticsContextUseCase;
};

export class AnalyticsContextController {
  constructor(private readonly dependencies: AnalyticsContextControllerDependencies) {}

  async getContext(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getAnalyticsContextUseCase.execute(this.getQuery(request))
    );
  }

  async getLatestContext(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getLatestAnalyticsContextUseCase.execute(this.getQuery(request))
    );
  }

  private getQuery(request: NextRequest): AnalyticsContextQueryDto {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    return {
      tenantId: request.headers.get("x-tenant-id") ?? url.searchParams.get("tenantId") ?? "",
      businessUnitId:
        request.headers.get("x-business-unit-id") ??
        url.searchParams.get("businessUnitId") ??
        undefined,
      limit: limit === null ? undefined : Number(limit)
    };
  }
}
