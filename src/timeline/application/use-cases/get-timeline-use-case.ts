import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type { TimelineOutputDto, TimelineQueryDto } from "@/timeline/application/dtos";
import { toTimelineGraphDto } from "@/timeline/application/dtos";
import { validateTimelineQuery } from "@/timeline/application/validation";
import {
  getTimelineBuilder,
  getTimelineClock,
  mapUnexpectedTimelineError,
  type BuildTimelineUseCaseDependencies
} from "@/timeline/application/use-cases/timeline-use-case-helpers";

export class GetTimelineUseCase implements UseCase<TimelineQueryDto, TimelineOutputDto> {
  constructor(private readonly dependencies: BuildTimelineUseCaseDependencies) {}

  async execute(input: TimelineQueryDto): Promise<Result<TimelineOutputDto>> {
    const validation = validateTimelineQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid timeline query."
      );
    }

    try {
      const source = await this.dependencies.timelineSourceRepository.load(validation.value);
      const graph = getTimelineBuilder(this.dependencies).build({
        ...source,
        generatedAt: getTimelineClock(this.dependencies).now(),
        limit: validation.value.limit
      });

      await this.dependencies.timelineRepository.saveGraph(graph);

      return ok({
        graph: toTimelineGraphDto(graph)
      });
    } catch (error) {
      const mappedError = mapUnexpectedTimelineError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
