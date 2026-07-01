import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  DashboardScopeDto,
  DomainBreakdownOutputDto
} from "@/dashboard/application/dtos";
import type { DashboardReadRepository } from "@/dashboard/application/repositories";
import { validateDashboardScope } from "@/dashboard/application/validation";
import {
  buildControlScoreDto,
  buildDomainBreakdownDtos,
  loadLatestScoreContext,
  mapUnexpectedDashboardError
} from "@/dashboard/application/use-cases/dashboard-use-case-helpers";

export type GetDomainBreakdownUseCaseDependencies = {
  dashboardReadRepository: DashboardReadRepository;
};

export class GetDomainBreakdownUseCase
  implements UseCase<DashboardScopeDto, DomainBreakdownOutputDto>
{
  constructor(private readonly dependencies: GetDomainBreakdownUseCaseDependencies) {}

  async execute(input: DashboardScopeDto): Promise<Result<DomainBreakdownOutputDto>> {
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

      return ok({
        controlScore: buildControlScoreDto(context.value.current, context.value.previous),
        domains: buildDomainBreakdownDtos(currentDomains, previousDomains)
      });
    } catch (error) {
      const mappedError = mapUnexpectedDashboardError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
