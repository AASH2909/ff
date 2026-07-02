import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import type {
  CopilotMessagesOutputDto,
  CopilotMessagesQueryDto
} from "@/copilot/application/dtos";
import { toCopilotMessageDto } from "@/copilot/application/dtos";
import { validateCopilotMessagesQuery } from "@/copilot/application/validation";
import {
  mapUnexpectedCopilotError,
  type CopilotUseCaseCommonDependencies
} from "@/copilot/application/use-cases/copilot-use-case-helpers";

export class GetCopilotMessagesUseCase
  implements UseCase<CopilotMessagesQueryDto, CopilotMessagesOutputDto>
{
  constructor(private readonly dependencies: CopilotUseCaseCommonDependencies) {}

  async execute(input: CopilotMessagesQueryDto): Promise<Result<CopilotMessagesOutputDto>> {
    const validation = validateCopilotMessagesQuery(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid copilot messages query."
      );
    }

    try {
      const session = await this.dependencies.copilotRepository.findSessionById(
        validation.value,
        validation.value.sessionId
      );

      if (!session) {
        return fail("NOT_FOUND", "Copilot session was not found.");
      }

      const messages = await this.dependencies.copilotRepository.findMessages(session.id);

      return ok({
        messages: messages.map(toCopilotMessageDto)
      });
    } catch (error) {
      const mappedError = mapUnexpectedCopilotError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
