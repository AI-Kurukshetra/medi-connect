import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { createAuditEvent } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface AssistanceProgramBody {
  name?: string;
  sponsor?: string;
  eligibilityRules?: Record<string, unknown>;
  active?: boolean;
}

export async function GET(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const serviceClient = getSupabaseServiceClient();
  const { data, error: queryError } = await serviceClient
    .from("assistance_programs")
    .select("id, name, sponsor, eligibility_rules, active, updated_at")
    .order("updated_at", { ascending: false });

  if (queryError) {
    return error({
      traceId,
      error: queryError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "assistance-programs" },
    });
  }

  return ok({
    roleMode: auth.context.role,
    scopeContext: { patientProfileId: null, module: "assistance-programs" },
    traceId,
    data: { items: data ?? [] },
  });
}

export async function POST(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  if (auth.context.role !== "provider") {
    return error({
      traceId,
      error: "Only providers can create assistance programs.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "assistance-programs" },
    });
  }

  const body = (await request.json()) as AssistanceProgramBody;
  if (!body.name?.trim() || !body.sponsor?.trim()) {
    return error({
      traceId,
      error: "name and sponsor are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "assistance-programs" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("assistance_programs")
    .insert({
      name: body.name.trim(),
      sponsor: body.sponsor.trim(),
      eligibility_rules: body.eligibilityRules ?? {},
      active: body.active ?? true,
    })
    .select("id, name, sponsor, eligibility_rules, active, updated_at")
    .single();

  if (insertError) {
    return error({
      traceId,
      error: insertError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "assistance-programs" },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "assistance.program.create",
    resourceType: "assistance_program",
    resourceId: data.id,
    traceId,
    scopeContext: { module: "assistance-programs", patientProfileId: null },
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: { patientProfileId: null, module: "assistance-programs" },
    traceId,
    auditRef,
    status: 201,
    data: { item: data },
  });
}

