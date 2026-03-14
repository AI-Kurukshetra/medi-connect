import type { AuthContext } from "@/lib/auth/server";
import { error } from "@/lib/api/envelope";
import {
  canAccessPatientProfile,
  resolveScopedPatientProfile,
} from "@/lib/data/role-scope";

export interface ScopedPatientContext {
  patientProfileId: string | null;
  scopeContext: {
    patientProfileId: string | null;
    module: string;
  };
}

export async function resolveScopedPatientForApi(params: {
  context: AuthContext;
  module: string;
  traceId: string;
  requestedPatientProfileId?: string | null;
}) {
  const scoped = await resolveScopedPatientProfile(
    params.context,
    params.requestedPatientProfileId,
  );

  if (scoped.unauthorizedRequest) {
    return {
      ok: false as const,
      response: error({
        traceId: params.traceId,
        error: "Patient profile not found.",
        status: 404,
        roleMode: params.context.role,
        scopeContext: {
          patientProfileId: null,
          module: params.module,
        },
      }),
    };
  }

  return {
    ok: true as const,
    value: {
      patientProfileId: scoped.patientProfileId,
      scopeContext: {
        patientProfileId: scoped.patientProfileId,
        module: params.module,
      },
    } satisfies ScopedPatientContext,
  };
}

export async function ensureResourceAccess(params: {
  context: AuthContext;
  module: string;
  traceId: string;
  patientProfileId: string | null;
}) {
  const hasAccess = await canAccessPatientProfile(
    params.context,
    params.patientProfileId,
  );

  if (hasAccess) {
    return { ok: true as const };
  }

  return {
    ok: false as const,
    response: error({
      traceId: params.traceId,
      error: "Forbidden.",
      status: 403,
      roleMode: params.context.role,
      scopeContext: {
        patientProfileId: params.patientProfileId,
        module: params.module,
      },
    }),
  };
}

