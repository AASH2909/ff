import type { NextRequest } from "next/server";
import type {
  DecisionScenarioByIdQueryDto,
  DecisionScenarioQueryDto,
  DecisionScenarioScopeDto,
  GenerateDecisionScenariosCommandDto,
  GenerateDecisionScenariosUseCase,
  GetDecisionScenarioByIdUseCase,
  GetDecisionScenariosUseCase,
  GetLatestDecisionScenarioUseCase
} from "@/decision/application";
import { jsonResult } from "@/decision/presentation/http/api-response";

export type DecisionControllerDependencies = {
  generateDecisionScenariosUseCase: GenerateDecisionScenariosUseCase;
  getDecisionScenariosUseCase: GetDecisionScenariosUseCase;
  getLatestDecisionScenarioUseCase: GetLatestDecisionScenarioUseCase;
  getDecisionScenarioByIdUseCase: GetDecisionScenarioByIdUseCase;
};

export class DecisionController {
  constructor(private readonly dependencies: DecisionControllerDependencies) {}

  async getDecisionScenarios(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getDecisionScenariosUseCase.execute(this.getDecisionQuery(request))
    );
  }

  async generateDecisionScenarios(request: NextRequest) {
    return jsonResult(
      await this.dependencies.generateDecisionScenariosUseCase.execute(
        this.getGenerateDecisionScenariosCommand(request)
      )
    );
  }

  async getLatestDecisionScenario(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getLatestDecisionScenarioUseCase.execute(
        this.getDecisionQuery(request)
      )
    );
  }

  async getDecisionScenarioById(request: NextRequest, id: string) {
    return jsonResult(
      await this.dependencies.getDecisionScenarioByIdUseCase.execute(
        this.getDecisionScenarioByIdQuery(request, id)
      )
    );
  }

  private getScope(request: NextRequest): DecisionScenarioScopeDto {
    const url = new URL(request.url);

    return {
      tenantId: request.headers.get("x-tenant-id") ?? url.searchParams.get("tenantId") ?? "",
      businessUnitId:
        request.headers.get("x-business-unit-id") ??
        url.searchParams.get("businessUnitId") ??
        undefined
    };
  }

  private getDecisionQuery(request: NextRequest): DecisionScenarioQueryDto {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    return {
      ...this.getScope(request),
      scenarioType: url.searchParams.get("scenarioType") ?? undefined,
      limit: limit === null ? undefined : Number(limit)
    };
  }

  private getDecisionScenarioByIdQuery(
    request: NextRequest,
    id: string
  ): DecisionScenarioByIdQueryDto {
    return {
      ...this.getScope(request),
      id
    };
  }

  private getGenerateDecisionScenariosCommand(
    request: NextRequest
  ): GenerateDecisionScenariosCommandDto {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    return {
      ...this.getScope(request),
      limit: limit === null ? undefined : Number(limit)
    };
  }
}
