import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type { TimelineByIdQueryDto, TimelineOutputDto } from "@/timeline/application/dtos";
import { toTimelineGraphDto } from "@/timeline/application/dtos";
import { validateTimelineByIdQuery } from "@/timeline/application/validation";
import {
  mapUnexpectedTimelineError,
  type TimelineUseCaseCommonDependencies
} from "@/timeline/application/use-cases/timeline-use-case-helpers";

export class GetTimelineGraphUseCase
  implements UseCase<TimelineByIdQueryDto, TimelineOutputDto>
{
  constructor(private readonly dependencies: TimelineUseCaseCommonDependencies) {}

  async execute(input: TimelineByIdQueryDto): Promise<Result<TimelineOutputDto>> {
    const validation = validateTimelineByIdQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid timeline graph query."
      );
    }

    try {
      const { tenantId, businessUnitId, id } = validation.value;
      const graph = await this.dependencies.timelineRepository.findGraphByEntryId(
        { tenantId, businessUnitId },
        id
      );

      if (!graph) {
        return fail("NOT_FOUND", "Timeline graph was not found.");
      }

      return ok({
        graph: toTimelineGraphDto(graph)
      });
    } catch (error) {
      const mappedError = mapUnexpectedTimelineError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
