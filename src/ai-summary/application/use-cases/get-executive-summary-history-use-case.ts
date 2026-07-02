import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  ExecutiveSummaryHistoryOutputDto,
  ExecutiveSummaryHistoryQueryDto
} from "@/ai-summary/application/dtos";
import { toExecutiveSummaryDto } from "@/ai-summary/application/dtos";
import type { ExecutiveSummaryRepository } from "@/ai-summary/application/repositories";
import { validateExecutiveSummaryHistoryQuery } from "@/ai-summary/application/validation";
import { mapUnexpectedAISummaryError } from "@/ai-summary/application/use-cases/ai-summary-use-case-helpers";

export type GetExecutiveSummaryHistoryUseCaseDependencies = {
  executiveSummaryRepository: ExecutiveSummaryRepository;
};

export class GetExecutiveSummaryHistoryUseCase
  implements UseCase<ExecutiveSummaryHistoryQueryDto, ExecutiveSummaryHistoryOutputDto>
{
  constructor(private readonly dependencies: GetExecutiveSummaryHistoryUseCaseDependencies) {}

  async execute(
    input: ExecutiveSummaryHistoryQueryDto
  ): Promise<Result<ExecutiveSummaryHistoryOutputDto>> {
    const validation = validateExecutiveSummaryHistoryQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid executive summary history query."
      );
    }

    try {
      const summaries = await this.dependencies.executiveSummaryRepository.findHistory(
        validation.value
      );

      return ok({
        summaries: summaries.map(toExecutiveSummaryDto)
      });
    } catch (error) {
      const mappedError = mapUnexpectedAISummaryError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
