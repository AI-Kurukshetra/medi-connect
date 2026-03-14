import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess, resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const allowedStatuses = new Set([
  "draft",
  "submitted",
  "payer-review",
  "approved",
  "denied",
  "appeal",
]);

interface PriorAuthBody {
  id?: string;
  patientProfileId?: string;
  insurancePolicyId?: string | null;
  medicationName?: string;
  diagnosisCode?: string;
  rationale?: string;
  status?: string;
}

function canCreateStatus(role: "patient" | "provider", status: string) {
  if (role === "provider") return true;
  return status === "draft" || status === "submitted";
}

export async function GET(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const requestedPatientProfileId = new URL(request.url).searchParams.get(
    "patientProfileId",
  );
  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "prior-auth",
    traceId,
    requestedPatientProfileId,
  });
  if (!scoped.ok) return scoped.response;

  if (!scoped.value.patientProfileId) {
    return ok({
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
      traceId,
      data: { items: [] },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data, error: queryError } = await serviceClient
    .from("prior_auth_requests")
    .select("id, patient_profile_id, medication_name, diagnosis_code, rationale, status, external_reference, submitted_at, reviewed_at, updated_at")
    .eq("patient_profile_id", scoped.value.patientProfileId)
    .order("updated_at", { ascending: false });

  if (queryError) {
    return error({
      traceId,
      error: queryError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  return ok({
    roleMode: auth.context.role,
    scopeContext: scoped.value.scopeContext,
    traceId,
    data: { items: data ?? [] },
  });
}

export async function POST(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as PriorAuthBody;
  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "prior-auth",
    traceId,
    requestedPatientProfileId: body.patientProfileId,
  });
  if (!scoped.ok) return scoped.response;

  const patientProfileId = scoped.value.patientProfileId;
  if (!patientProfileId) {
    return error({
      traceId,
      error: "No scoped patient profile is available.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  if (!body.medicationName?.trim() || !body.diagnosisCode?.trim()) {
    return error({
      traceId,
      error: "medicationName and diagnosisCode are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const status = body.status?.trim() ?? "draft";
  if (!allowedStatuses.has(status)) {
    return error({
      traceId,
      error: "Invalid status.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }
  if (!canCreateStatus(auth.context.role, status)) {
    return error({
      traceId,
      error: "Patients can only create draft or submitted requests.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("prior_auth_requests")
    .insert({
      patient_profile_id: patientProfileId,
      provider_user_id: auth.context.role === "provider" ? auth.context.userId : null,
      insurance_policy_id: body.insurancePolicyId ?? null,
      medication_name: body.medicationName.trim(),
      diagnosis_code: body.diagnosisCode.trim(),
      rationale: body.rationale?.trim() ?? "",
      status,
      submitted_at: status === "submitted" ? new Date().toISOString() : null,
    })
    .select("id, patient_profile_id, medication_name, diagnosis_code, rationale, status, submitted_at, updated_at")
    .single();

  if (insertError) {
    return error({
      traceId,
      error: insertError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const eventInsert = await serviceClient.from("prior_auth_events").insert({
    prior_auth_request_id: data.id,
    actor_user_id: auth.context.userId,
    from_status: null,
    to_status: status,
    note: "Request created",
  });

  if (eventInsert.error) {
    return error({
      traceId,
      error: eventInsert.error.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "prior_auth.request.create",
    resourceType: "prior_auth_request",
    resourceId: data.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
    metadata: redactedMetadata({
      status,
      medicationName: body.medicationName,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: scoped.value.scopeContext,
    traceId,
    auditRef,
    status: 201,
    data: { item: data },
  });
}

export async function PATCH(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as PriorAuthBody;
  const id = body.id?.trim();
  if (!id) {
    return error({
      traceId,
      error: "id is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "prior-auth" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: existing, error: existingError } = await serviceClient
    .from("prior_auth_requests")
    .select("id, patient_profile_id, status")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return error({
      traceId,
      error: existingError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "prior-auth" },
    });
  }
  if (!existing) {
    return error({
      traceId,
      error: "Prior authorization request not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "prior-auth" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "prior-auth",
    traceId,
    patientProfileId: existing.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const updates: Record<string, string | null> = {};
  if (typeof body.medicationName === "string") updates.medication_name = body.medicationName.trim();
  if (typeof body.diagnosisCode === "string") updates.diagnosis_code = body.diagnosisCode.trim();
  if (typeof body.rationale === "string") updates.rationale = body.rationale.trim();

  if (body.status) {
    if (!allowedStatuses.has(body.status)) {
      return error({
        traceId,
        error: "Invalid status.",
        status: 422,
        roleMode: auth.context.role,
        scopeContext: {
          patientProfileId: existing.patient_profile_id,
          module: "prior-auth",
        },
      });
    }
    if (auth.context.role === "patient" && body.status !== existing.status) {
      return error({
        traceId,
        error: "Patients cannot change status directly. Use events workflow.",
        status: 403,
        roleMode: auth.context.role,
        scopeContext: {
          patientProfileId: existing.patient_profile_id,
          module: "prior-auth",
        },
      });
    }
    updates.status = body.status;
  }

  const { data, error: updateError } = await serviceClient
    .from("prior_auth_requests")
    .update(updates)
    .eq("id", id)
    .select("id, patient_profile_id, medication_name, diagnosis_code, rationale, status, updated_at")
    .single();

  if (updateError) {
    return error({
      traceId,
      error: updateError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: existing.patient_profile_id,
        module: "prior-auth",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "prior_auth.request.update",
    resourceType: "prior_auth_request",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "prior-auth",
    },
    metadata: redactedMetadata({
      changedStatus: updates.status ?? null,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "prior-auth",
    },
    traceId,
    auditRef,
    data: { item: data },
  });
}

