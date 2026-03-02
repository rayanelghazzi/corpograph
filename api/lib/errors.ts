import { NextResponse } from "next/server";

export type ErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INVALID_STATE"
  | "JOB_ACTIVE"
  | "PRECONDITION_FAILED"
  | "UPLOAD_ERROR"
  | "LLM_ERROR"
  | "INTERNAL_ERROR";

const STATUS_MAP: Record<ErrorCode, number> = {
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  INVALID_STATE: 409,
  JOB_ACTIVE: 409,
  PRECONDITION_FAILED: 409,
  UPLOAD_ERROR: 400,
  LLM_ERROR: 502,
  INTERNAL_ERROR: 500,
};

export function errorResponse(
  code: ErrorCode,
  message: string,
  details: Record<string, unknown> = {}
) {
  return NextResponse.json(
    { error: { code, message, details } },
    { status: STATUS_MAP[code] }
  );
}
