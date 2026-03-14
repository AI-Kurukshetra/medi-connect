import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface EhrLinkBody {
  patientProfileId?: string;
  vendor?: string;
  fhirBaseUrl?: string;
  externalPatientId?: string;
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
    module: "ehr-links",
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
    .from("ehr_links")
    .select("id, vendor, fhir_base_url, external_patient_id, status, last_synced_at, updated_at")
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

  const body = (await request.json()) as EhrLinkBody;
  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "ehr-links",
    traceId,
    requestedPatientProfileId: body.patientProfileId,
  });
  if (!scoped.ok) return scoped.response;

  if (!scoped.value.patientProfileId) {
    return error({
      traceId,
      error: "No scoped patient profile is available.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  if (!body.vendor?.trim() || !body.fhirBaseUrl?.trim() || !body.externalPatientId?.trim()) {
    return error({
      traceId,
      error: "vendor, fhirBaseUrl, and externalPatientId are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("ehr_links")
    .insert({
      patient_profile_id: scoped.value.patientProfileId,
      provider_user_id: auth.context.role === "provider" ? auth.context.userId : null,
      vendor: body.vendor.trim(),
      fhir_base_url: body.fhirBaseUrl.trim(),
      external_patient_id: body.externalPatientId.trim(),
      status: "linked",
    })
    .select("id, vendor, fhir_base_url, external_patient_id, status, updated_at")
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

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "ehr.link.create",
    resourceType: "ehr_link",
    resourceId: data.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
    metadata: redactedMetadata({
      vendor: data.vendor,
      adapter: "hybrid-fhir",
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

