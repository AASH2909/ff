import { NextResponse } from "next/server";
import type { ApplicationError, Result } from "@/application/result";

export type NotificationApiSuccessResponse<T> = {
  data: T;
  meta: {
    generatedAt: string;
  };
};

export type NotificationApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
  meta: {
    generatedAt: string;
  };
};

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json<NotificationApiSuccessResponse<T>>(
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
  return NextResponse.json<NotificationApiErrorResponse>(
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

function mapErrorStatus(error: ApplicationError) {
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
