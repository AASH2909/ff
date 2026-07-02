"use client";

import * as React from "react";
import type { RecommendationsOutputDto } from "@/recommendation/application/dtos";
import {
  getExecutiveRecommendations,
  getHighPriorityRecommendations,
  RecommendationApiError,
  type RecommendationClientScope
} from "@/recommendation/presentation/web/api/recommendation-api-client";

export type RecommendationLoadState = "idle" | "loading" | "success" | "error";

export type RecommendationLoadError = {
  status: number;
  code: string;
  message: string;
};

export type ExecutiveRecommendationData = {
  all: RecommendationsOutputDto;
  highPriority: RecommendationsOutputDto;
};

export function useExecutiveRecommendations(scope: RecommendationClientScope) {
  const [state, setState] = React.useState<RecommendationLoadState>("idle");
  const [data, setData] = React.useState<ExecutiveRecommendationData | null>(null);
  const [error, setError] = React.useState<RecommendationLoadError | null>(null);

  const normalizedScope = React.useMemo(
    () => ({
      tenantId: scope.tenantId.trim(),
      businessUnitId: scope.businessUnitId?.trim() || undefined,
      limit: scope.limit
    }),
    [scope.businessUnitId, scope.limit, scope.tenantId]
  );

  const load = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!normalizedScope.tenantId) {
        setData(null);
        setError(null);
        setState("idle");
        return;
      }

      setState("loading");
      setError(null);

      try {
        const [all, highPriority] = await Promise.all([
          getExecutiveRecommendations(normalizedScope, { signal }),
          getHighPriorityRecommendations(normalizedScope, { signal })
        ]);

        setData({ all, highPriority });
        setState("success");
      } catch (caught) {
        if (signal?.aborted) {
          return;
        }

        setData(null);
        setError(toLoadError(caught));
        setState("error");
      }
    },
    [normalizedScope]
  );

  React.useEffect(() => {
    const controller = new AbortController();

    void load(controller.signal);

    return () => {
      controller.abort();
    };
  }, [load]);

  return {
    state,
    data,
    error,
    refresh: React.useCallback(() => load(), [load])
  };
}

function toLoadError(error: unknown): RecommendationLoadError {
  if (error instanceof RecommendationApiError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      code: "REQUEST_FAILED",
      message: error.message
    };
  }

  return {
    status: 500,
    code: "REQUEST_FAILED",
    message: "Executive recommendations could not be loaded."
  };
}
