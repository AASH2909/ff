import type { ApplicationError } from "@/application/result";
import type { Clock } from "@/application/ports/clock";
import { systemClock } from "@/application/ports/clock";
import type { IdGenerator } from "@/application/ports/id-generator";

export type NotificationUseCaseCommonDependencies = {
  clock?: Clock;
  idGenerator?: IdGenerator;
};

export function getNotificationClock(dependencies: NotificationUseCaseCommonDependencies) {
  return dependencies.clock ?? systemClock;
}

export function getNotificationIdGenerator(
  dependencies: NotificationUseCaseCommonDependencies
) {
  return dependencies.idGenerator ?? systemIdGenerator;
}

export function mapUnexpectedNotificationError(error: unknown): ApplicationError {
  void error;

  return {
    code: "PERSISTENCE_ERROR",
    message: "Unable to process notification center data."
  };
}

const systemIdGenerator: IdGenerator = {
  nextId: () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};
