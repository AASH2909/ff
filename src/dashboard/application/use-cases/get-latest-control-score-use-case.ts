import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  DashboardScopeDto,
  LatestControlScoreOutputDto
} from "@/dashboard/application/dtos";
import type { DashboardReadRepository } from "@/dashboard/application/repositories";
import { validateDashboardScope } from "@/dashboard/application/validation";
import {
  buildControlScoreDto,
  loadLatestScoreContext,
  mapUnexpectedDashboardError
} from "@/dashboard/application/use-cases/dashboard-use-case-helpers";

export type GetLatestControlScoreUseCaseDependencies = {
  dashboardReadRepository: DashboardReadRepository;
};

export class GetLatestControlScoreUseCase
  implements UseCase<DashboardScopeDto, LatestControlScoreOutputDto>
{
  constructor(private readonly dependencies: GetLatestControlScoreUseCaseDependencies) {}

  async execute(input: DashboardScopeDto): Promise<Result<LatestControlScoreOutputDto>> {
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

      return ok({
        controlScore: buildControlScoreDto(context.value.current, context.value.previous)
      });
    } catch (error) {
      const mappedError = mapUnexpectedDashboardError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
