import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface PriorAuthEventBody {
  toStatus?: "draft" | "submitted" | "payer-review" | "approved" | "denied" | "appeal";
  note?: string;
}

const allowedTransitions: Record<string, string[]> = {
  draft: ["submitted"],
  submitted: ["payer-review", "appeal"],
  "payer-review": ["approved", "denied", "appeal"],
  denied: ["appeal"],
  appeal: ["payer-review", "approved", "denied"],
  approved: [],
};

function canTransition(params: {
  role: "patient" | "provider";
  fromStatus: string;
  toStatus: string;
}) {
  const validTargets = allowedTransitions[params.fromStatus] ?? [];
  if (!validTargets.includes(params.toStatus)) {
    return false;
  }

  if (params.role === "provider") return true;
  return params.fromStatus === "draft" && params.toStatus === "submitted";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const serviceClient = getSupabaseServiceClient();
  const { data: requestRow } = await serviceClient
    .from("prior_auth_requests")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!requestRow) {
    return error({
      traceId,
      error: "Prior authorization request not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "prior-auth-events" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "prior-auth-events",
    traceId,
    patientProfileId: requestRow.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const { data, error: queryError } = await serviceClient
    .from("prior_auth_events")
    .select("id, actor_user_id, from_status, to_status, note, created_at")
    .eq("prior_auth_request_id", id)
    .order("created_at", { ascending: true });

  if (queryError) {
    return error({
      traceId,
      error: queryError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: requestRow.patient_profile_id,
        module: "prior-auth-events",
      },
    });
  }

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: requestRow.patient_profile_id,
      module: "prior-auth-events",
    },
    traceId,
    data: { items: data ?? [] },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const body = (await request.json()) as PriorAuthEventBody;
  if (!body.toStatus) {
    return error({
      traceId,
      error: "toStatus is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "prior-auth-events" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: requestRow, error: requestError } = await serviceClient
    .from("prior_auth_requests")
    .select("id, patient_profile_id, status")
    .eq("id", id)
    .single();

  if (requestError || !requestRow) {
    return error({
      traceId,
      error: "Prior authorization request not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "prior-auth-events" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "prior-auth-events",
    traceId,
    patientProfileId: requestRow.patient_profile_id,
  });
  if (!access.ok) return access.response;

  if (
    !canTransition({
      role: auth.context.role,
      fromStatus: requestRow.status,
      toStatus: body.toStatus,
    })
  ) {
    return error({
      traceId,
      error: `Invalid transition from ${requestRow.status} to ${body.toStatus}.`,
      status: 422,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: requestRow.patient_profile_id,
        module: "prior-auth-events",
      },
    });
  }

  const eventInsert = await serviceClient
    .from("prior_auth_events")
    .insert({
      prior_auth_request_id: id,
      actor_user_id: auth.context.userId,
      from_status: requestRow.status,
      to_status: body.toStatus,
      note: body.note?.trim() ?? "",
    })
    .select("id, actor_user_id, from_status, to_status, note, created_at")
    .single();

  if (eventInsert.error || !eventInsert.data) {
    return error({
      traceId,
      error: eventInsert.error?.message ?? "Failed to create prior auth event.",
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: requestRow.patient_profile_id,
        module: "prior-auth-events",
      },
    });
  }

  const requestUpdate = await serviceClient
    .from("prior_auth_requests")
    .update({
      status: body.toStatus,
      submitted_at:
        body.toStatus === "submitted"
          ? new Date().toISOString()
          : requestRow.status === "submitted"
            ? null
            : undefined,
      reviewed_at:
        body.toStatus === "approved" || body.toStatus === "denied"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", id)
    .select("id, status, updated_at")
    .single();

  if (requestUpdate.error) {
    return error({
      traceId,
      error: requestUpdate.error.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: requestRow.patient_profile_id,
        module: "prior-auth-events",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "prior_auth.request.transition",
    resourceType: "prior_auth_request",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: requestRow.patient_profile_id,
      module: "prior-auth-events",
    },
    metadata: redactedMetadata({
      fromStatus: requestRow.status,
      toStatus: body.toStatus,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: requestRow.patient_profile_id,
      module: "prior-auth-events",
    },
    traceId,
    auditRef,
    status: 201,
    data: {
      event: eventInsert.data,
      request: requestUpdate.data,
    },
  });
}

