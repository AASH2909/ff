import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  ExecutiveSummaryLatestQueryDto,
  ExecutiveSummaryOutputDto
} from "@/ai-summary/application/dtos";
import { toExecutiveSummaryDto } from "@/ai-summary/application/dtos";
import type { ExecutiveSummaryRepository } from "@/ai-summary/application/repositories";
import { validateExecutiveSummaryLatestQuery } from "@/ai-summary/application/validation";
import { mapUnexpectedAISummaryError } from "@/ai-summary/application/use-cases/ai-summary-use-case-helpers";

export type GetLatestExecutiveSummaryUseCaseDependencies = {
  executiveSummaryRepository: ExecutiveSummaryRepository;
};

export class GetLatestExecutiveSummaryUseCase
  implements UseCase<ExecutiveSummaryLatestQueryDto, ExecutiveSummaryOutputDto>
{
  constructor(private readonly dependencies: GetLatestExecutiveSummaryUseCaseDependencies) {}

  async execute(input: ExecutiveSummaryLatestQueryDto): Promise<Result<ExecutiveSummaryOutputDto>> {
    const validation = validateExecutiveSummaryLatestQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid executive summary query."
      );
    }

    try {
      const { tenantId, businessUnitId, summaryType } = validation.value;
      const summary = await this.dependencies.executiveSummaryRepository.findLatest(
        { tenantId, businessUnitId },
        summaryType
      );

      if (!summary) {
        return fail("NOT_FOUND", "Executive summary was not found for this scope.");
      }

      return ok({
        summary: toExecutiveSummaryDto(summary)
      });
    } catch (error) {
      const mappedError = mapUnexpectedAISummaryError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
