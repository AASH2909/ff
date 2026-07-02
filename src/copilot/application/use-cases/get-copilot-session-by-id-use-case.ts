import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  CopilotSessionByIdQueryDto,
  CopilotSessionOutputDto
} from "@/copilot/application/dtos";
import { toCopilotSessionDto } from "@/copilot/application/dtos";
import { validateCopilotSessionByIdQuery } from "@/copilot/application/validation";
import {
  mapUnexpectedCopilotError,
  type CopilotUseCaseCommonDependencies
} from "@/copilot/application/use-cases/copilot-use-case-helpers";

export class GetCopilotSessionByIdUseCase
  implements UseCase<CopilotSessionByIdQueryDto, CopilotSessionOutputDto>
{
  constructor(private readonly dependencies: CopilotUseCaseCommonDependencies) {}

  async execute(
    input: CopilotSessionByIdQueryDto
  ): Promise<Result<CopilotSessionOutputDto>> {
    const validation = validateCopilotSessionByIdQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid copilot session query."
      );
    }

    try {
      const session = await this.dependencies.copilotRepository.findSessionById(
        validation.value,
        validation.value.id
      );

      if (!session) {
        return fail("NOT_FOUND", "Copilot session was not found.");
      }

      return ok({
        session: toCopilotSessionDto(session)
      });
    } catch (error) {
      const mappedError = mapUnexpectedCopilotError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
