import { NextResponse } from "next/server";
import type { ApplicationError, Result } from "@/application/result";

export type ApiSuccessResponse<T> = {
  data: T;
  meta: {
    generatedAt: string;
  };
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
  meta: {
    generatedAt: string;
  };
};

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    {
      data,
      meta: {
        generatedAt: new Date().toISOString()
      }
    },
    { status }
  );
}

export function jsonError(error: ApplicationError, status = mapErrorStatus(error)) {
  return NextResponse.json<ApiErrorResponse>(
    {
      error: {
        code: error.code,
        message: error.message
      },
      meta: {
        generatedAt: new Date().toISOString()
      }
    },
    { status }
  );
}

export function jsonResult<T>(result: Result<T>) {
  if (result.ok) {
    return jsonSuccess(result.value);
  }

  return jsonError(result.error);
}

export function mapErrorStatus(error: ApplicationError) {
  if (error.code === "VALIDATION_ERROR") {
    return 400;
  }

  if (error.code === "NOT_FOUND") {
    return 404;
  }

  if (error.code === "BUSINESS_RULE_VIOLATION") {
    return 409;
  }

  return 500;
}
