import { fail, ok, type Result } from "@/application/result";
import type { UseCase } from "@/application/use-cases";
import {
  CopilotMessage,
  CopilotSession
} from "@/copilot/domain";
import type {
  AskCopilotCommandDto,
  AskCopilotOutputDto
} from "@/copilot/application/dtos";
import {
  toCopilotAnswerDraftDto,
  toCopilotContextSnapshotDto,
  toCopilotMessageDto,
  toCopilotSessionDto
} from "@/copilot/application/dtos";
import { validateAskCopilotCommand } from "@/copilot/application/validation";
import {
  getCopilotClock,
  mapUnexpectedCopilotError,
  type AskCopilotUseCaseDependencies
} from "@/copilot/application/use-cases/copilot-use-case-helpers";

export class AskCopilotUseCase
  implements UseCase<AskCopilotCommandDto, AskCopilotOutputDto>
{
  constructor(private readonly dependencies: AskCopilotUseCaseDependencies) {}

  async execute(input: AskCopilotCommandDto): Promise<Result<AskCopilotOutputDto>> {
    const validation = validateAskCopilotCommand(input);

    if (validation.error || !validation.value) {
      return fail(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid copilot request."
      );
    }

    try {
      const existingSession = validation.value.sessionId
        ? await this.dependencies.copilotRepository.findSessionById(
            validation.value,
            validation.value.sessionId
          )
        : null;

      if (validation.value.sessionId && !existingSession) {
        return fail("NOT_FOUND", "Copilot session was not found.");
      }

      if (existingSession && !existingSession.isActive) {
        return fail("BUSINESS_RULE_VIOLATION", "Copilot session is closed.");
      }

      const clock = getCopilotClock(this.dependencies);
      const now = clock.now();
      const sessionId = existingSession?.id ?? this.dependencies.idGenerator.nextId();
      const businessUnitId =
        existingSession?.businessUnitId ?? validation.value.businessUnitId ?? null;
      const session = new CopilotSession({
        id: sessionId,
        tenantId: validation.value.tenantId,
        businessUnitId,
        status: "ACTIVE",
        createdAt: existingSession?.createdAt ?? now,
        updatedAt: now,
        metadata: existingSession?.metadata ?? {
          source: "copilot_api"
        }
      });
      const engineOutput = await this.dependencies.copilotEngine.answer({
        sessionId,
        tenantId: validation.value.tenantId,
        ...(businessUnitId ? { businessUnitId } : {}),
        question: validation.value.question,
        limit: validation.value.limit
      });
      const userMessage = new CopilotMessage({
        id: this.dependencies.idGenerator.nextId(),
        sessionId,
        role: "USER",
        content: validation.value.question,
        intent: engineOutput.intent,
        createdAt: now,
        metadata: validation.value.metadata
      });
      const assistantMessage = new CopilotMessage({
        id: this.dependencies.idGenerator.nextId(),
        sessionId,
        role: "ASSISTANT",
        content: engineOutput.answerDraft.answer,
        intent: engineOutput.intent,
        createdAt: engineOutput.answerDraft.createdAt,
        metadata: {
          answerDraftId: engineOutput.answerDraft.id,
          confidence: engineOutput.answerDraft.confidence,
          sourceCount: engineOutput.answerDraft.sources.length,
          recommendedActionCount: engineOutput.answerDraft.recommendedActions.length,
          contextSnapshotId: engineOutput.contextSnapshot.id
        }
      });
      const updatedSession = new CopilotSession({
        ...session.toSnapshot(),
        updatedAt: assistantMessage.createdAt
      });

      await this.dependencies.copilotRepository.saveSession(updatedSession);
      await this.dependencies.copilotRepository.saveMessage(userMessage);
      await this.dependencies.copilotRepository.saveContextSnapshot(
        engineOutput.contextSnapshot
      );
      await this.dependencies.copilotRepository.saveMessage(assistantMessage);

      return ok({
        session: toCopilotSessionDto(updatedSession),
        userMessage: toCopilotMessageDto(userMessage),
        assistantMessage: toCopilotMessageDto(assistantMessage),
        answerDraft: toCopilotAnswerDraftDto(engineOutput.answerDraft),
        contextSnapshot: toCopilotContextSnapshotDto(engineOutput.contextSnapshot)
      });
    } catch (error) {
      const mappedError = mapUnexpectedCopilotError(error);
      return fail(mappedError.code, mappedError.message);
    }
  }
}
