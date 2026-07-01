import type { NextRequest } from "next/server";
import type {
  GetControlScoreHistoryUseCase,
  GetDashboardAlertsUseCase,
  GetDashboardInsightsUseCase,
  GetDashboardOverviewUseCase,
  GetDomainBreakdownUseCase,
  GetLatestControlScoreUseCase
} from "@/dashboard/application";
import type { DashboardQueryDto, DashboardScopeDto } from "@/dashboard/application";
import { jsonResult } from "@/dashboard/presentation/http/api-response";

export type DashboardControllerDependencies = {
  getOverviewUseCase: GetDashboardOverviewUseCase;
  getLatestControlScoreUseCase: GetLatestControlScoreUseCase;
  getControlScoreHistoryUseCase: GetControlScoreHistoryUseCase;
  getDomainBreakdownUseCase: GetDomainBreakdownUseCase;
  getDashboardAlertsUseCase: GetDashboardAlertsUseCase;
  getDashboardInsightsUseCase: GetDashboardInsightsUseCase;
};

export class DashboardController {
  constructor(private readonly dependencies: DashboardControllerDependencies) {}

  async getOverview(request: NextRequest) {
    return jsonResult(await this.dependencies.getOverviewUseCase.execute(this.getDashboardQuery(request)));
  }

  async getLatestControlScore(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getLatestControlScoreUseCase.execute(this.getDashboardScope(request))
    );
  }

  async getControlScoreHistory(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getControlScoreHistoryUseCase.execute(this.getDashboardQuery(request))
    );
  }

  async getDomainBreakdown(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getDomainBreakdownUseCase.execute(this.getDashboardScope(request))
    );
  }

  async getAlerts(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getDashboardAlertsUseCase.execute(this.getDashboardScope(request))
    );
  }

  async getInsights(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getDashboardInsightsUseCase.execute(this.getDashboardScope(request))
    );
  }

  private getDashboardScope(request: NextRequest): DashboardScopeDto {
    const url = new URL(request.url);

    return {
      tenantId: request.headers.get("x-tenant-id") ?? url.searchParams.get("tenantId") ?? "",
      businessUnitId:
        request.headers.get("x-business-unit-id") ?? url.searchParams.get("businessUnitId") ?? undefined
    };
  }

  private getDashboardQuery(request: NextRequest): DashboardQueryDto {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    return {
      ...this.getDashboardScope(request),
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      limit: limit === null ? undefined : Number(limit)
    };
  }
}
