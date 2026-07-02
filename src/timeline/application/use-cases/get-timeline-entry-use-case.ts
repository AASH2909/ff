import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  TimelineByIdQueryDto,
  TimelineEntryOutputDto
} from "@/timeline/application/dtos";
import { toTimelineEntryDto } from "@/timeline/application/dtos";
import { validateTimelineByIdQuery } from "@/timeline/application/validation";
import {
  mapUnexpectedTimelineError,
  type TimelineUseCaseCommonDependencies
} from "@/timeline/application/use-cases/timeline-use-case-helpers";

export class GetTimelineEntryUseCase
  implements UseCase<TimelineByIdQueryDto, TimelineEntryOutputDto>
{
  constructor(private readonly dependencies: TimelineUseCaseCommonDependencies) {}

  async execute(input: TimelineByIdQueryDto): Promise<Result<TimelineEntryOutputDto>> {
    const validation = validateTimelineByIdQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid timeline entry query."
      );
    }

    try {
      const { tenantId, businessUnitId, id } = validation.value;
      const entry = await this.dependencies.timelineRepository.findEntryById(
        { tenantId, businessUnitId },
        id
      );

      if (!entry) {
        return fail("NOT_FOUND", "Timeline entry was not found.");
      }

      return ok({
        entry: toTimelineEntryDto(entry)
      });
    } catch (error) {
      const mappedError = mapUnexpectedTimelineError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
