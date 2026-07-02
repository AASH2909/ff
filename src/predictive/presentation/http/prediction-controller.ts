import type { NextRequest } from "next/server";
import type {
  GetLatestPredictionUseCase,
  GetPredictionByIdUseCase,
  GetPredictionsUseCase,
  PredictionByIdQueryDto,
  PredictionQueryDto,
  PredictionScopeDto
} from "@/predictive/application";
import { jsonResult } from "@/predictive/presentation/http/api-response";

export type PredictionControllerDependencies = {
  getPredictionsUseCase: GetPredictionsUseCase;
  getLatestPredictionUseCase: GetLatestPredictionUseCase;
  getPredictionByIdUseCase: GetPredictionByIdUseCase;
};

export class PredictionController {
  constructor(private readonly dependencies: PredictionControllerDependencies) {}

  async getPredictions(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getPredictionsUseCase.execute(this.getPredictionQuery(request))
    );
  }

  async getLatestPrediction(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getLatestPredictionUseCase.execute(this.getPredictionQuery(request))
    );
  }

  async getPredictionById(request: NextRequest, id: string) {
    return jsonResult(
      await this.dependencies.getPredictionByIdUseCase.execute(
        this.getPredictionByIdQuery(request, id)
      )
    );
  }

  private getScope(request: NextRequest): PredictionScopeDto {
    const url = new URL(request.url);

    return {
      tenantId: request.headers.get("x-tenant-id") ?? url.searchParams.get("tenantId") ?? "",
      businessUnitId:
        request.headers.get("x-business-unit-id") ??
        url.searchParams.get("businessUnitId") ??
        undefined
    };
  }

  private getPredictionQuery(request: NextRequest): PredictionQueryDto {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    return {
      ...this.getScope(request),
      predictionType: url.searchParams.get("predictionType") ?? undefined,
      predictionWindow: url.searchParams.get("predictionWindow") ?? undefined,
      limit: limit === null ? undefined : Number(limit)
    };
  }

  private getPredictionByIdQuery(request: NextRequest, id: string): PredictionByIdQueryDto {
    const url = new URL(request.url);

    return {
      ...this.getScope(request),
      id,
      predictionWindow: url.searchParams.get("predictionWindow") ?? undefined
    };
  }
}
