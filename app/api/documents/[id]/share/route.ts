import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getDocumentClient } from "@/lib/integrations/documents";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface ShareBody {
  sharedWithUserId?: string;
  permission?: "view" | "edit";
  expiresAt?: string | null;
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
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!document) {
    return error({
      traceId,
      error: "Document not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "documents-share" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "documents-share",
    traceId,
    patientProfileId: document.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const { data, error: queryError } = await serviceClient
    .from("document_shares")
    .select("id, shared_with_user_id, permission, signed_url, expires_at, created_at")
    .eq("document_id", id)
    .order("created_at", { ascending: false });

  if (queryError) {
    return error({
      traceId,
      error: queryError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: document.patient_profile_id,
        module: "documents-share",
      },
    });
  }

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: document.patient_profile_id,
      module: "documents-share",
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
  const body = (await request.json()) as ShareBody;

  if (!body.sharedWithUserId?.trim()) {
    return error({
      traceId,
      error: "sharedWithUserId is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "documents-share" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: document } = await serviceClient
    .from("documents")
    .select("id, patient_profile_id, storage_key")
    .eq("id", id)
    .maybeSingle();

  if (!document) {
    return error({
      traceId,
      error: "Document not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "documents-share" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "documents-share",
    traceId,
    patientProfileId: document.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const documentClient = getDocumentClient();
  const signedDownload = await documentClient.createSignedDownloadUrl(
    document.storage_key,
  );

  const { data, error: insertError } = await serviceClient
    .from("document_shares")
    .insert({
      document_id: id,
      shared_with_user_id: body.sharedWithUserId.trim(),
      permission: body.permission ?? "view",
      signed_url: signedDownload.signedUrl,
      expires_at: body.expiresAt ?? signedDownload.expiresAt,
    })
    .select("id, shared_with_user_id, permission, signed_url, expires_at, created_at")
    .single();

  if (insertError) {
    return error({
      traceId,
      error: insertError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: document.patient_profile_id,
        module: "documents-share",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "documents.share.create",
    resourceType: "document_share",
    resourceId: data.id,
    traceId,
    scopeContext: {
      patientProfileId: document.patient_profile_id,
      module: "documents-share",
    },
    metadata: redactedMetadata({
      permission: data.permission,
      adapterProvider: documentClient.provider,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: document.patient_profile_id,
      module: "documents-share",
    },
    traceId,
    auditRef,
    status: 201,
    data: { item: data },
  });
}

