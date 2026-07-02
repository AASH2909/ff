import type { NextRequest } from "next/server";
import type {
  GetHighPriorityRecommendationsUseCase,
  GetRecommendationByIdUseCase,
  GetRecommendationsUseCase
} from "@/recommendation/application";
import type {
  RecommendationByIdQueryDto,
  RecommendationQueryDto,
  RecommendationScopeDto
} from "@/recommendation/application";
import { jsonResult } from "@/recommendation/presentation/http/api-response";

export type RecommendationControllerDependencies = {
  getRecommendationsUseCase: GetRecommendationsUseCase;
  getHighPriorityRecommendationsUseCase: GetHighPriorityRecommendationsUseCase;
  getRecommendationByIdUseCase: GetRecommendationByIdUseCase;
};

export class RecommendationController {
  constructor(private readonly dependencies: RecommendationControllerDependencies) {}

  async getRecommendations(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getRecommendationsUseCase.execute(this.getRecommendationQuery(request))
    );
  }

  async getHighPriorityRecommendations(request: NextRequest) {
    return jsonResult(
      await this.dependencies.getHighPriorityRecommendationsUseCase.execute(
        this.getRecommendationQuery(request)
      )
    );
  }

  async getRecommendationById(request: NextRequest, id: string) {
    return jsonResult(
      await this.dependencies.getRecommendationByIdUseCase.execute(
        this.getRecommendationByIdQuery(request, id)
      )
    );
  }

  private getRecommendationScope(request: NextRequest): RecommendationScopeDto {
    const url = new URL(request.url);

    return {
      tenantId: request.headers.get("x-tenant-id") ?? url.searchParams.get("tenantId") ?? "",
      businessUnitId:
        request.headers.get("x-business-unit-id") ??
        url.searchParams.get("businessUnitId") ??
        undefined
    };
  }

  private getRecommendationQuery(request: NextRequest): RecommendationQueryDto {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    return {
      ...this.getRecommendationScope(request),
      limit: limit === null ? undefined : Number(limit)
    };
  }

  private getRecommendationByIdQuery(
    request: NextRequest,
    id: string
  ): RecommendationByIdQueryDto {
    return {
      ...this.getRecommendationScope(request),
      id
    };
  }
}
