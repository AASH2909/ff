import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  ExecutiveSummaryByIdQueryDto,
  ExecutiveSummaryOutputDto
} from "@/ai-summary/application/dtos";
import { toExecutiveSummaryDto } from "@/ai-summary/application/dtos";
import type { ExecutiveSummaryRepository } from "@/ai-summary/application/repositories";
import { validateExecutiveSummaryByIdQuery } from "@/ai-summary/application/validation";
import { mapUnexpectedAISummaryError } from "@/ai-summary/application/use-cases/ai-summary-use-case-helpers";

export type GetExecutiveSummaryByIdUseCaseDependencies = {
  executiveSummaryRepository: ExecutiveSummaryRepository;
};

export class GetExecutiveSummaryByIdUseCase
  implements UseCase<ExecutiveSummaryByIdQueryDto, ExecutiveSummaryOutputDto>
{
  constructor(private readonly dependencies: GetExecutiveSummaryByIdUseCaseDependencies) {}

  async execute(input: ExecutiveSummaryByIdQueryDto): Promise<Result<ExecutiveSummaryOutputDto>> {
    const validation = validateExecutiveSummaryByIdQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid executive summary id query."
      );
    }

    try {
      const { tenantId, businessUnitId, id } = validation.value;
      const summary = await this.dependencies.executiveSummaryRepository.findById(
        { tenantId, businessUnitId },
        id
      );

      if (!summary) {
        return fail("NOT_FOUND", "Executive summary was not found.");
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
