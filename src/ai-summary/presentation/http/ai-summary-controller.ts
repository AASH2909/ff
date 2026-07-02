import type { NextRequest } from "next/server";
import type {
  ExecutiveSummaryByIdQueryDto,
  ExecutiveSummaryHistoryQueryDto,
  ExecutiveSummaryLatestQueryDto,
  GenerateExecutiveSummaryDto,
  GenerateExecutiveSummaryUseCase,
  GetExecutiveSummaryByIdUseCase,
  GetExecutiveSummaryHistoryUseCase,
  GetLatestExecutiveSummaryUseCase
} from "@/ai-summary/application";
import { jsonError, jsonResult } from "@/ai-summary/presentation/http/api-response";

export type AISummaryControllerDependencies = {
  generateExecutiveSummaryUseCase: GenerateExecutiveSummaryUseCase;
  getLatestExecutiveSummaryUseCase: GetLatestExecutiveSummaryUseCase;
  getExecutiveSummaryByIdUseCase: GetExecutiveSummaryByIdUseCase;
  getExecutiveSummaryHistoryUseCase: GetExecutiveSummaryHistoryUseCase;
};

export class AISummaryController {
  constructor(private readonly dependencies: AISummaryControllerDependencies) {}

  async generateExecutiveSummary(request: NextRequest) {
    const body = await parseJsonObject(request);

    if (!body.ok) {
      return jsonError({
        code: "VALIDATION_ERROR",
        message: "Request body must be a valid JSON object."
      });
    }

    return jsonResult(
      await this.dependencies.generateExecutiveSummaryUseCase.execute(
        this.getGenerateSummaryInput(request, body.value)
      )
    );
  }

  async getLatestExecutiveSummary(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getLatestExecutiveSummaryUseCase.execute(
        this.getLatestSummaryQuery(request)
      )
    );
  }

  async getExecutiveSummaryById(request: NextRequest, id: string) {
    return jsonResult(
      await this.dependencies.getExecutiveSummaryByIdUseCase.execute(
        this.getSummaryByIdQuery(request, id)
      )
    );
  }

  async getExecutiveSummaryHistory(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getExecutiveSummaryHistoryUseCase.execute(
        this.getHistorySummaryQuery(request)
      )
    );
  }

  private getScope(request: NextRequest, body?: Record<string, unknown>) {
    const url = new URL(request.url);
    const bodyTenantId = getString(body?.tenantId);
    const bodyBusinessUnitId = getString(body?.businessUnitId);

    return {
      tenantId: request.headers.get("x-tenant-id") ?? url.searchParams.get("tenantId") ?? bodyTenantId ?? "",
      businessUnitId:
        request.headers.get("x-business-unit-id") ??
        url.searchParams.get("businessUnitId") ??
        bodyBusinessUnitId ??
        undefined
    };
  }

  private getGenerateSummaryInput(
    request: NextRequest,
    body: Record<string, unknown>
  ): GenerateExecutiveSummaryDto {
    return {
      ...this.getScope(request, body),
      summaryType: getString(body.summaryType),
      periodStart: getString(body.periodStart),
      periodEnd: getString(body.periodEnd)
    };
  }

  private getLatestSummaryQuery(request: NextRequest): ExecutiveSummaryLatestQueryDto {
    const url = new URL(request.url);

    return {
      ...this.getScope(request),
      summaryType: url.searchParams.get("summaryType") ?? undefined
    };
  }

  private getSummaryByIdQuery(
    request: NextRequest,
    id: string
  ): ExecutiveSummaryByIdQueryDto {
    return {
      ...this.getScope(request),
      id
    };
  }

  private getHistorySummaryQuery(request: NextRequest): ExecutiveSummaryHistoryQueryDto {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    return {
      ...this.getScope(request),
      summaryType: url.searchParams.get("summaryType") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      limit: limit === null ? undefined : Number(limit)
    };
  }
}

async function parseJsonObject(
  request: NextRequest
): Promise<{ ok: true; value: Record<string, unknown> } | { ok: false }> {
  try {
    const text = await request.text();

    if (text.trim().length === 0) {
      return {
        ok: true,
        value: {}
      };
    }

    const body: unknown = JSON.parse(text);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { ok: false };
    }

    return {
      ok: true,
      value: body as Record<string, unknown>
    };
  } catch {
    return { ok: false };
  }
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}
