import { NextResponse } from "next/server";
import type { AppRole } from "@/lib/auth/server";

export interface ScopeContext {
  patientProfileId: string | null;
  resourceOwnerId?: string | null;
  module?: string;
}

export interface ApiEnvelope<T> {
  roleMode: AppRole;
  scopeContext: ScopeContext;
  traceId: string;
  auditRef: string | null;
  data: T;
}

export interface ApiErrorEnvelope {
  roleMode: AppRole | "anonymous";
  scopeContext: ScopeContext;
  traceId: string;
  auditRef: string | null;
  error: string;
}

export function resolveTraceId(request: Request) {
  const headerTraceId = request.headers.get("x-trace-id")?.trim();
  if (headerTraceId) {
    return headerTraceId;
  }

  return crypto.randomUUID();
}

export function ok<T>(params: {
  roleMode: AppRole;
  scopeContext: ScopeContext;
  traceId: string;
  data: T;
  auditRef?: string | null;
  status?: number;
}) {
  const body: ApiEnvelope<T> = {
    roleMode: params.roleMode,
    scopeContext: params.scopeContext,
    traceId: params.traceId,
    auditRef: params.auditRef ?? null,
    data: params.data,
  };

  return NextResponse.json(body, { status: params.status ?? 200 });
}

export function error(params: {
  traceId: string;
  error: string;
  status: number;
  roleMode?: AppRole | "anonymous";
  scopeContext?: ScopeContext;
  auditRef?: string | null;
}) {
  const body: ApiErrorEnvelope = {
    roleMode: params.roleMode ?? "anonymous",
    scopeContext: params.scopeContext ?? { patientProfileId: null },
    traceId: params.traceId,
    auditRef: params.auditRef ?? null,
    error: params.error,
  };

  return NextResponse.json(body, { status: params.status });
}

