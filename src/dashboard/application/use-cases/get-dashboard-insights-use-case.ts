import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  DashboardInsightsOutputDto,
  DashboardScopeDto
} from "@/dashboard/application/dtos";
import { toScoreExplanationDto } from "@/dashboard/application/dtos";
import type { DashboardReadRepository } from "@/dashboard/application/repositories";
import { validateDashboardScope } from "@/dashboard/application/validation";
import {
  buildControlScoreDto,
  buildDomainChangeDtos,
  buildExecutiveAttentionRisks,
  buildInsights,
  loadLatestScoreContext,
  mapUnexpectedDashboardError
} from "@/dashboard/application/use-cases/dashboard-use-case-helpers";

export type GetDashboardInsightsUseCaseDependencies = {
  dashboardReadRepository: DashboardReadRepository;
};

export class GetDashboardInsightsUseCase
  implements UseCase<DashboardScopeDto, DashboardInsightsOutputDto>
{
  constructor(private readonly dependencies: GetDashboardInsightsUseCaseDependencies) {}

  async execute(input: DashboardScopeDto): Promise<Result<DashboardInsightsOutputDto>> {
    const validation = validateDashboardScope(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid dashboard scope."
      );
    }

    try {
      const context = await loadLatestScoreContext(
        this.dependencies.dashboardReadRepository,
        validation.value
      );

      if (!context.ok) {
        return context;
      }

      const explanations = await this.dependencies.dashboardReadRepository.findScoreExplanations(
        validation.value,
        context.value.current.id
      );
      const currentDomains = await this.dependencies.dashboardReadRepository.findDomainScores(
        validation.value,
        context.value.current.id
      );
      const previousDomains = context.value.previous
        ? await this.dependencies.dashboardReadRepository.findDomainScores(
            validation.value,
            context.value.previous.id
          )
        : [];
      const domainChanges = buildDomainChangeDtos(currentDomains, previousDomains);

      return ok({
        controlScore: buildControlScoreDto(context.value.current, context.value.previous),
        scoreChange: context.value.current.getScoreChange(context.value.previous),
        explanations: explanations.map(toScoreExplanationDto),
        insights: buildInsights(
          context.value.current.tenantId,
          context.value.current.id,
          explanations
        ),
        improvedDomains: domainChanges.improvedDomains,
        deterioratedDomains: domainChanges.deterioratedDomains,
        executiveAttentionRisks: buildExecutiveAttentionRisks(
          context.value.current.tenantId,
          context.value.current.id,
          explanations
        )
      });
    } catch (error) {
      const mappedError = mapUnexpectedDashboardError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
