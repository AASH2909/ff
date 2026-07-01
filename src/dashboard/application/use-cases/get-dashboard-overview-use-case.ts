import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type { DashboardOverviewDto, DashboardQueryDto } from "@/dashboard/application/dtos";
import type { DashboardReadRepository } from "@/dashboard/application/repositories";
import {
  DEFAULT_DASHBOARD_ALERT_LIMIT,
  validateDashboardQuery
} from "@/dashboard/application/validation";
import {
  buildAlertDtos,
  buildControlScoreDto,
  buildDomainBreakdownDtos,
  buildDomainResultAlerts,
  buildExecutiveSummary,
  buildExplanationAlerts,
  buildTopNegativeDrivers,
  buildTopPositiveDrivers,
  buildTrendDtos,
  loadLatestScoreContext,
  mapUnexpectedDashboardError
} from "@/dashboard/application/use-cases/dashboard-use-case-helpers";

export type GetDashboardOverviewUseCaseDependencies = {
  dashboardReadRepository: DashboardReadRepository;
};

export class GetDashboardOverviewUseCase
  implements UseCase<DashboardQueryDto, DashboardOverviewDto>
{
  constructor(private readonly dependencies: GetDashboardOverviewUseCaseDependencies) {}

  async execute(input: DashboardQueryDto): Promise<Result<DashboardOverviewDto>> {
    const validation = validateDashboardQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid dashboard query."
      );
    }

    try {
      const { tenantId, businessUnitId, from, to, limit } = validation.value;
      const scope = { tenantId, businessUnitId };
      const context = await loadLatestScoreContext(this.dependencies.dashboardReadRepository, scope);

      if (!context.ok) {
        return context;
      }

      const [history, currentDomains, previousDomains, explanations, persistedAlerts, riskAlerts] =
        await Promise.all([
          this.dependencies.dashboardReadRepository.findControlScoreHistory(scope, { from, to, limit }),
          this.dependencies.dashboardReadRepository.findDomainScores(scope, context.value.current.id),
          context.value.previous
            ? this.dependencies.dashboardReadRepository.findDomainScores(
                scope,
                context.value.previous.id
              )
            : Promise.resolve([]),
          this.dependencies.dashboardReadRepository.findScoreExplanations(
            scope,
            context.value.current.id
          ),
          this.dependencies.dashboardReadRepository.findActiveDashboardAlerts(
            scope,
            DEFAULT_DASHBOARD_ALERT_LIMIT
          ),
          this.dependencies.dashboardReadRepository.findActiveRiskAlerts(
            scope,
            DEFAULT_DASHBOARD_ALERT_LIMIT
          )
        ]);

      const controlScore = buildControlScoreDto(context.value.current, context.value.previous);
      const activeAlerts = buildAlertDtos(
        [
          ...buildExplanationAlerts(
            context.value.current.tenantId,
            context.value.current.businessUnitId,
            explanations
          ),
          ...buildDomainResultAlerts(
            context.value.current.tenantId,
            context.value.current.businessUnitId,
            currentDomains
          )
        ],
        [...persistedAlerts, ...riskAlerts]
      );

      return ok({
        currentControlScore: controlScore,
        domainScores: buildDomainBreakdownDtos(currentDomains, previousDomains),
        trend: buildTrendDtos(history),
        topPositiveDrivers: buildTopPositiveDrivers(
          context.value.current.tenantId,
          context.value.current.id,
          explanations
        ),
        topNegativeDrivers: buildTopNegativeDrivers(
          context.value.current.tenantId,
          context.value.current.id,
          explanations
        ),
        activeAlerts,
        executiveSummary: buildExecutiveSummary(controlScore, activeAlerts, new Date()),
        lastCalculationTime: context.value.current.calculatedAt.toISOString()
      });
    } catch (error) {
      const mappedError = mapUnexpectedDashboardError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
