import type { NextRequest } from "next/server";
import type {
  AskCopilotCommandDto,
  AskCopilotUseCase,
  CopilotMessagesQueryDto,
  CopilotScopeDto,
  CopilotSessionByIdQueryDto,
  CopilotSessionQueryDto,
  GetCopilotMessagesUseCase,
  GetCopilotSessionByIdUseCase,
  GetCopilotSessionsUseCase
} from "@/copilot/application";
import type { CopilotMetadata } from "@/copilot/domain";
import { jsonResult } from "@/copilot/presentation/http/api-response";

export type CopilotControllerDependencies = {
  askCopilotUseCase: AskCopilotUseCase;
  getCopilotSessionsUseCase: GetCopilotSessionsUseCase;
  getCopilotSessionByIdUseCase: GetCopilotSessionByIdUseCase;
  getCopilotMessagesUseCase: GetCopilotMessagesUseCase;
};

export class CopilotController {
  constructor(private readonly dependencies: CopilotControllerDependencies) {}

  async ask(request: NextRequest) {
    return jsonResult(
      await this.dependencies.askCopilotUseCase.execute(await this.getAskCommand(request))
    );
  }

  async getSessions(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getCopilotSessionsUseCase.execute(this.getSessionQuery(request))
    );
  }

  async getSessionById(request: NextRequest, id: string) {
    return jsonResult(
      await this.dependencies.getCopilotSessionByIdUseCase.execute(
        this.getSessionByIdQuery(request, id)
      )
    );
  }

  async getMessages(request: NextRequest, sessionId: string) {
    return jsonResult(
      await this.dependencies.getCopilotMessagesUseCase.execute(
        this.getMessagesQuery(request, sessionId)
      )
    );
  }

  private async getAskCommand(request: NextRequest): Promise<AskCopilotCommandDto> {
    const url = new URL(request.url);
    const body = toRecord(await request.json().catch(() => ({})));
    const limit = readNumber(url.searchParams.get("limit")) ?? readNumber(body.limit);

    return {
      ...this.getScope(request),
      sessionId: readString(body.sessionId),
      question: readString(body.question) ?? readString(body.content) ?? "",
      limit,
      metadata: readMetadata(body.metadata)
    };
  }

  private getSessionQuery(request: NextRequest): CopilotSessionQueryDto {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    return {
      ...this.getScope(request),
      status: url.searchParams.get("status") ?? undefined,
      limit: limit === null ? undefined : Number(limit)
    };
  }

  private getSessionByIdQuery(
    request: NextRequest,
    id: string
  ): CopilotSessionByIdQueryDto {
    return {
      ...this.getScope(request),
      id
    };
  }

  private getMessagesQuery(request: NextRequest, sessionId: string): CopilotMessagesQueryDto {
    return {
      ...this.getScope(request),
      sessionId
    };
  }

  private getScope(request: NextRequest): CopilotScopeDto {
    const url = new URL(request.url);

    return {
      tenantId: request.headers.get("x-tenant-id") ?? url.searchParams.get("tenantId") ?? "",
      businessUnitId:
        request.headers.get("x-business-unit-id") ??
        url.searchParams.get("businessUnitId") ??
        undefined
    };
  }
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function readMetadata(value: unknown): CopilotMetadata | undefined {
  const record = toRecord(value);
  const entries = Object.entries(record).filter((entry): entry is [string, CopilotMetadata[string]] =>
    isMetadataValue(entry[1])
  );

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

function isMetadataValue(value: unknown): value is CopilotMetadata[string] {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" || typeof item === "number")
  );
}
