import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  ExecutiveSummaryOutputDto,
  GenerateExecutiveSummaryDto
} from "@/ai-summary/application/dtos";
import { toExecutiveSummaryDto } from "@/ai-summary/application/dtos";
import type {
  ExecutiveSummaryRepository,
  ExecutiveSummarySourceRepository
} from "@/ai-summary/application/repositories";
import { validateGenerateExecutiveSummaryInput } from "@/ai-summary/application/validation";
import { DeterministicExecutiveSummaryBuilder } from "@/ai-summary/domain";
import {
  buildAISummaryGeneratedEvent,
  getClock,
  getEventPublisher,
  getIdGenerator,
  mapUnexpectedAISummaryError,
  type AISummaryUseCaseCommonDependencies
} from "@/ai-summary/application/use-cases/ai-summary-use-case-helpers";

export type GenerateExecutiveSummaryUseCaseDependencies =
  AISummaryUseCaseCommonDependencies & {
    executiveSummaryRepository: ExecutiveSummaryRepository;
    executiveSummarySourceRepository: ExecutiveSummarySourceRepository;
    summaryBuilder?: DeterministicExecutiveSummaryBuilder;
  };

export class GenerateExecutiveSummaryUseCase
  implements UseCase<GenerateExecutiveSummaryDto, ExecutiveSummaryOutputDto>
{
  constructor(private readonly dependencies: GenerateExecutiveSummaryUseCaseDependencies) {}

  async execute(input: GenerateExecutiveSummaryDto): Promise<Result<ExecutiveSummaryOutputDto>> {
    const validation = validateGenerateExecutiveSummaryInput(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid AI executive summary request."
      );
    }

    try {
      const { tenantId, businessUnitId, summaryType } = validation.value;
      const context = await this.dependencies.executiveSummarySourceRepository.loadContext({
        tenantId,
        businessUnitId
      });

      if (!context) {
        return fail("NOT_FOUND", "Executive summary source data was not found for this scope.");
      }

      const generatedAt = getClock(this.dependencies).now();
      const summaryBuilder =
        this.dependencies.summaryBuilder ?? new DeterministicExecutiveSummaryBuilder();
      const summary = summaryBuilder.build({
        id: getIdGenerator(this.dependencies).nextId(),
        summaryType,
        periodStart: validation.value.periodStart ?? context.score.periodStart,
        periodEnd: validation.value.periodEnd ?? context.score.periodEnd,
        context,
        generatedAt
      });

      await this.dependencies.executiveSummaryRepository.save(summary);
      await getEventPublisher(this.dependencies).publish(buildAISummaryGeneratedEvent(summary));

      return ok({
        summary: toExecutiveSummaryDto(summary)
      });
    } catch (error) {
      const mappedError = mapUnexpectedAISummaryError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
