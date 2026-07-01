import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  ControlScoreHistoryOutputDto,
  DashboardQueryDto
} from "@/dashboard/application/dtos";
import type { DashboardReadRepository } from "@/dashboard/application/repositories";
import { validateDashboardQuery } from "@/dashboard/application/validation";
import {
  buildTrendDtos,
  mapUnexpectedDashboardError
} from "@/dashboard/application/use-cases/dashboard-use-case-helpers";

export type GetControlScoreHistoryUseCaseDependencies = {
  dashboardReadRepository: DashboardReadRepository;
};

export class GetControlScoreHistoryUseCase
  implements UseCase<DashboardQueryDto, ControlScoreHistoryOutputDto>
{
  constructor(private readonly dependencies: GetControlScoreHistoryUseCaseDependencies) {}

  async execute(input: DashboardQueryDto): Promise<Result<ControlScoreHistoryOutputDto>> {
    const validation = validateDashboardQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid dashboard query."
      );
    }

    try {
      const { tenantId, businessUnitId, from, to, limit } = validation.value;
      const history = await this.dependencies.dashboardReadRepository.findControlScoreHistory(
        { tenantId, businessUnitId },
        { from, to, limit }
      );

      return ok({
        history: buildTrendDtos(history)
      });
    } catch (error) {
      const mappedError = mapUnexpectedDashboardError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
