import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  AnalyticsContextOutputDto,
  AnalyticsContextQueryDto
} from "@/analytics-context/application/dtos";
import { toAnalyticsContextDto } from "@/analytics-context/application/dtos";
import type { AnalyticsContextSourceRepository } from "@/analytics-context/application/repositories";
import { validateAnalyticsContextQuery } from "@/analytics-context/application/validation";
import { AnalyticsContextAggregator } from "@/analytics-context/domain";
import {
  mapUnexpectedAnalyticsContextError,
  type AnalyticsContextUseCaseCommonDependencies
} from "@/analytics-context/application/use-cases/analytics-context-use-case-helpers";

export type GetAnalyticsContextUseCaseDependencies =
  AnalyticsContextUseCaseCommonDependencies & {
    analyticsContextSourceRepository: AnalyticsContextSourceRepository;
    aggregator?: AnalyticsContextAggregator;
  };

export class GetAnalyticsContextUseCase
  implements UseCase<AnalyticsContextQueryDto, AnalyticsContextOutputDto>
{
  constructor(private readonly dependencies: GetAnalyticsContextUseCaseDependencies) {}

  async execute(input: AnalyticsContextQueryDto): Promise<Result<AnalyticsContextOutputDto>> {
    const validation = validateAnalyticsContextQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid analytics context query."
      );
    }

    try {
      const source = await this.dependencies.analyticsContextSourceRepository.load(
        validation.value
      );
      const context = (this.dependencies.aggregator ?? new AnalyticsContextAggregator()).aggregate(
        source
      );

      return ok({
        context: toAnalyticsContextDto(context)
      });
    } catch (error) {
      const mappedError = mapUnexpectedAnalyticsContextError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
