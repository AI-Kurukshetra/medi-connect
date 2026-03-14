import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess } from "@/lib/api/patient-scope";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getFhirClient } from "@/lib/integrations/fhir";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const patientProfileId = new URL(request.url).searchParams.get("patientProfileId");
  if (!patientProfileId) {
    return error({
      traceId,
      error: "patientProfileId query param is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "ehr-summary" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "ehr-summary",
    traceId,
    patientProfileId,
  });
  if (!access.ok) return access.response;

  const serviceClient = getSupabaseServiceClient();
  const { data: link } = await serviceClient
    .from("ehr_links")
    .select("id, external_patient_id, vendor, status, last_synced_at")
    .eq("patient_profile_id", patientProfileId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!link) {
    return ok({
      roleMode: auth.context.role,
      scopeContext: { patientProfileId, module: "ehr-summary" },
      traceId,
      data: {
        item: null,
        summary: "No EHR link configured for this patient profile.",
      },
    });
  }

  const fhirClient = getFhirClient();
  const summary = await fhirClient.fetchPatientSummary(link.external_patient_id);

  return ok({
    roleMode: auth.context.role,
    scopeContext: { patientProfileId, module: "ehr-summary" },
    traceId,
    data: {
      link,
      summary,
      adapterProvider: fhirClient.provider,
    },
  });
}

