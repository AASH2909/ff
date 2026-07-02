import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  CopilotSessionQueryDto,
  CopilotSessionsOutputDto
} from "@/copilot/application/dtos";
import { toCopilotSessionDto } from "@/copilot/application/dtos";
import { validateCopilotSessionQuery } from "@/copilot/application/validation";
import {
  mapUnexpectedCopilotError,
  type CopilotUseCaseCommonDependencies
} from "@/copilot/application/use-cases/copilot-use-case-helpers";

export class GetCopilotSessionsUseCase
  implements UseCase<CopilotSessionQueryDto, CopilotSessionsOutputDto>
{
  constructor(private readonly dependencies: CopilotUseCaseCommonDependencies) {}

  async execute(input: CopilotSessionQueryDto): Promise<Result<CopilotSessionsOutputDto>> {
    const validation = validateCopilotSessionQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid copilot session query."
      );
    }

    try {
      const sessions = await this.dependencies.copilotRepository.findSessions(validation.value);

      return ok({
        sessions: sessions.map(toCopilotSessionDto)
      });
    } catch (error) {
      const mappedError = mapUnexpectedCopilotError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
