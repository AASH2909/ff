import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type { DashboardAlertsOutputDto, DashboardScopeDto } from "@/dashboard/application/dtos";
import type { DashboardReadRepository } from "@/dashboard/application/repositories";
import {
  DEFAULT_DASHBOARD_ALERT_LIMIT,
  validateDashboardScope
} from "@/dashboard/application/validation";
import {
  buildAlertDtos,
  buildDomainResultAlerts,
  buildExplanationAlerts,
  mapUnexpectedDashboardError
} from "@/dashboard/application/use-cases/dashboard-use-case-helpers";

export type GetDashboardAlertsUseCaseDependencies = {
  dashboardReadRepository: DashboardReadRepository;
};

export class GetDashboardAlertsUseCase
  implements UseCase<DashboardScopeDto, DashboardAlertsOutputDto>
{
  constructor(private readonly dependencies: GetDashboardAlertsUseCaseDependencies) {}

  async execute(input: DashboardScopeDto): Promise<Result<DashboardAlertsOutputDto>> {
    const validation = validateDashboardScope(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid dashboard scope."
      );
    }

    try {
      const current = await this.dependencies.dashboardReadRepository.findLatestControlScore(
        validation.value
      );
      const persistedAlerts = await this.dependencies.dashboardReadRepository.findActiveDashboardAlerts(
        validation.value,
        DEFAULT_DASHBOARD_ALERT_LIMIT
      );
      const riskAlerts = await this.dependencies.dashboardReadRepository.findActiveRiskAlerts(
        validation.value,
        DEFAULT_DASHBOARD_ALERT_LIMIT
      );

      if (!current) {
        return ok({
          alerts: buildAlertDtos([], [...persistedAlerts, ...riskAlerts])
        });
      }

      const explanations = await this.dependencies.dashboardReadRepository.findScoreExplanations(
        validation.value,
        current.id
      );
      const domainScores = await this.dependencies.dashboardReadRepository.findDomainScores(
        validation.value,
        current.id
      );

      return ok({
        alerts: buildAlertDtos(
          [
            ...buildExplanationAlerts(current.tenantId, current.businessUnitId, explanations),
            ...buildDomainResultAlerts(current.tenantId, current.businessUnitId, domainScores)
          ],
          [...persistedAlerts, ...riskAlerts]
        )
      });
    } catch (error) {
      const mappedError = mapUnexpectedDashboardError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
