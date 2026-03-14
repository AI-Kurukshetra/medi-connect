import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getDocumentClient } from "@/lib/integrations/documents";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface DocumentUpdateBody {
  title?: string;
  category?: string;
  visibility?: "patient" | "provider" | "both";
  status?: "active" | "archived";
  newStorageKey?: string;
  mimeType?: string;
  sizeBytes?: number;
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
  const { data: document } = await serviceClient
    .from("documents")
    .select("id, patient_profile_id, title, category, version, storage_key, mime_type, size_bytes, visibility, status, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!document) {
    return error({
      traceId,
      error: "Document not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "documents" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "documents",
    traceId,
    patientProfileId: document.patient_profile_id,
  });
  if (!access.ok) return access.response;

  if (auth.context.role === "patient" && document.visibility === "provider") {
    return error({
      traceId,
      error: "Document not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: document.patient_profile_id,
        module: "documents",
      },
    });
  }

  const documentClient = getDocumentClient();
  const signedUrl = await documentClient.createSignedDownloadUrl(document.storage_key);

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: document.patient_profile_id,
      module: "documents",
    },
    traceId,
    data: {
      item: document,
      signedDownload: signedUrl,
      adapterProvider: documentClient.provider,
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = (await request.json()) as DocumentUpdateBody;

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("documents")
    .select("id, patient_profile_id, version")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return error({
      traceId,
      error: "Document not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "documents" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "documents",
    traceId,
    patientProfileId: existing.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const updates: Record<string, string | number> = {};
  if (typeof body.title === "string") updates.title = body.title.trim();
  if (typeof body.category === "string") updates.category = body.category.trim();
  if (typeof body.visibility === "string") updates.visibility = body.visibility;
  if (typeof body.status === "string") updates.status = body.status;
  if (typeof body.mimeType === "string") updates.mime_type = body.mimeType.trim();
  if (typeof body.sizeBytes === "number") {
    updates.size_bytes = Math.max(0, Math.floor(body.sizeBytes));
  }

  if (typeof body.newStorageKey === "string" && body.newStorageKey.trim()) {
    updates.storage_key = body.newStorageKey.trim();
    updates.version = existing.version + 1;
  }

  const { data, error: updateError } = await serviceClient
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select("id, patient_profile_id, title, category, version, storage_key, mime_type, size_bytes, visibility, status, updated_at")
    .single();

  if (updateError) {
    return error({
      traceId,
      error: updateError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: existing.patient_profile_id,
        module: "documents",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "documents.update",
    resourceType: "document",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "documents",
    },
    metadata: redactedMetadata({
      newVersion: data.version,
      status: data.status,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "documents",
    },
    traceId,
    auditRef,
    data: { item: data },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("documents")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return error({
      traceId,
      error: "Document not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "documents" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "documents",
    traceId,
    patientProfileId: existing.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const { error: deleteError } = await serviceClient.from("documents").delete().eq("id", id);
  if (deleteError) {
    return error({
      traceId,
      error: deleteError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: existing.patient_profile_id,
        module: "documents",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "documents.delete",
    resourceType: "document",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "documents",
    },
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "documents",
    },
    traceId,
    auditRef,
    data: { deletedId: id },
  });
}

