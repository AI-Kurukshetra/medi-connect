import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface DocumentBody {
  patientProfileId?: string;
  title?: string;
  category?: string;
  storageKey?: string;
  mimeType?: string;
  sizeBytes?: number;
  visibility?: "patient" | "provider" | "both";
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
    module: "documents",
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
  let query = serviceClient
    .from("documents")
    .select("id, title, category, version, storage_key, mime_type, size_bytes, visibility, status, updated_at")
    .eq("patient_profile_id", scoped.value.patientProfileId)
    .order("updated_at", { ascending: false });

  if (auth.context.role === "patient") {
    query = query.in("visibility", ["patient", "both"]);
  }

  const { data, error: queryError } = await query;
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

  const body = (await request.json()) as DocumentBody;
  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "documents",
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

  if (
    !body.title?.trim() ||
    !body.category?.trim() ||
    !body.storageKey?.trim() ||
    !body.mimeType?.trim()
  ) {
    return error({
      traceId,
      error: "title, category, storageKey, and mimeType are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("documents")
    .insert({
      patient_profile_id: scoped.value.patientProfileId,
      uploaded_by_user_id: auth.context.userId,
      title: body.title.trim(),
      category: body.category.trim(),
      storage_key: body.storageKey.trim(),
      mime_type: body.mimeType.trim(),
      size_bytes: Math.max(0, Math.floor(body.sizeBytes ?? 0)),
      visibility: body.visibility ?? "both",
      version: 1,
    })
    .select("id, title, category, version, storage_key, mime_type, size_bytes, visibility, status, updated_at")
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
    action: "documents.create",
    resourceType: "document",
    resourceId: data.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
    metadata: redactedMetadata({
      category: data.category,
      visibility: data.visibility,
      version: data.version,
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

