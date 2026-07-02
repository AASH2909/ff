import type { ApplicationError } from "@/application/result";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type {
  TimelineRepository,
  TimelineSourceRepository
} from "@/timeline/application/repositories";
import { TimelineBuilder } from "@/timeline/domain";

export type TimelineUseCaseCommonDependencies = {
  timelineRepository: TimelineRepository;
};

export type BuildTimelineUseCaseDependencies = TimelineUseCaseCommonDependencies & {
  timelineSourceRepository: TimelineSourceRepository;
  timelineBuilder?: TimelineBuilder;
  clock?: Clock;
};

export function getTimelineBuilder(dependencies: BuildTimelineUseCaseDependencies) {
  return dependencies.timelineBuilder ?? new TimelineBuilder();
}

export function getTimelineClock(dependencies: BuildTimelineUseCaseDependencies) {
  return dependencies.clock ?? systemClock;
}

export function mapUnexpectedTimelineError(error: unknown): ApplicationError {
  void error;

  return {
    code: "PERSISTENCE_ERROR",
    message: "Unable to load executive timeline data."
  };
}
