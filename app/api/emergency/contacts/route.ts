import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess, resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface ContactBody {
  id?: string;
  patientProfileId?: string;
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string | null;
  isPrimary?: boolean;
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
    module: "emergency-contacts",
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
    .from("emergency_contacts")
    .select("id, name, relationship, phone, email, is_primary, updated_at")
    .eq("patient_profile_id", scoped.value.patientProfileId)
    .order("is_primary", { ascending: false });

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
  const body = (await request.json()) as ContactBody;

  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "emergency-contacts",
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

  if (!body.name?.trim() || !body.relationship?.trim() || !body.phone?.trim()) {
    return error({
      traceId,
      error: "name, relationship, and phone are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const serviceClient = getSupabaseServiceClient();
  if (body.isPrimary) {
    await serviceClient
      .from("emergency_contacts")
      .update({ is_primary: false })
      .eq("patient_profile_id", scoped.value.patientProfileId);
  }

  const { data, error: insertError } = await serviceClient
    .from("emergency_contacts")
    .insert({
      patient_profile_id: scoped.value.patientProfileId,
      name: body.name.trim(),
      relationship: body.relationship.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() ?? null,
      is_primary: Boolean(body.isPrimary),
    })
    .select("id, name, relationship, phone, email, is_primary, updated_at")
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
    action: "emergency.contact.create",
    resourceType: "emergency_contact",
    resourceId: data.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
    metadata: redactedMetadata({
      isPrimary: data.is_primary,
      relationship: data.relationship,
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
  const body = (await request.json()) as ContactBody;
  const id = body.id?.trim();

  if (!id) {
    return error({
      traceId,
      error: "id is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "emergency-contacts" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("emergency_contacts")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return error({
      traceId,
      error: "Emergency contact not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "emergency-contacts" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "emergency-contacts",
    traceId,
    patientProfileId: existing.patient_profile_id,
  });
  if (!access.ok) return access.response;

  if (body.isPrimary) {
    await serviceClient
      .from("emergency_contacts")
      .update({ is_primary: false })
      .eq("patient_profile_id", existing.patient_profile_id);
  }

  const updates: Record<string, string | boolean | null> = {};
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.relationship === "string") updates.relationship = body.relationship.trim();
  if (typeof body.phone === "string") updates.phone = body.phone.trim();
  if (typeof body.email === "string" || body.email === null) {
    updates.email = body.email?.trim() ?? null;
  }
  if (typeof body.isPrimary === "boolean") updates.is_primary = body.isPrimary;

  const { data, error: updateError } = await serviceClient
    .from("emergency_contacts")
    .update(updates)
    .eq("id", id)
    .select("id, name, relationship, phone, email, is_primary, updated_at")
    .single();

  if (updateError) {
    return error({
      traceId,
      error: updateError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: existing.patient_profile_id,
        module: "emergency-contacts",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "emergency.contact.update",
    resourceType: "emergency_contact",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "emergency-contacts",
    },
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "emergency-contacts",
    },
    traceId,
    auditRef,
    data: { item: data },
  });
}

export async function DELETE(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    return error({
      traceId,
      error: "id query param is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "emergency-contacts" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("emergency_contacts")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return error({
      traceId,
      error: "Emergency contact not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "emergency-contacts" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "emergency-contacts",
    traceId,
    patientProfileId: existing.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const { error: deleteError } = await serviceClient
    .from("emergency_contacts")
    .delete()
    .eq("id", id);
  if (deleteError) {
    return error({
      traceId,
      error: deleteError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: existing.patient_profile_id,
        module: "emergency-contacts",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "emergency.contact.delete",
    resourceType: "emergency_contact",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "emergency-contacts",
    },
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: existing.patient_profile_id,
      module: "emergency-contacts",
    },
    traceId,
    auditRef,
    data: { deletedId: id },
  });
}

