import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess, resolveScopedPatientForApi } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface InvoiceBody {
  patientProfileId?: string;
  amountCents?: number;
  currency?: string;
  dueAt?: string | null;
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
    module: "billing-invoices",
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
    .from("invoices")
    .select("id, invoice_number, amount_cents, currency, status, due_at, issued_at, updated_at")
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
  if (auth.context.role !== "provider") {
    return error({
      traceId,
      error: "Only providers can create invoices.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "billing-invoices" },
    });
  }

  const body = (await request.json()) as InvoiceBody;
  const scoped = await resolveScopedPatientForApi({
    context: auth.context,
    module: "billing-invoices",
    traceId,
    requestedPatientProfileId: body.patientProfileId,
  });
  if (!scoped.ok) return scoped.response;

  if (!scoped.value.patientProfileId || typeof body.amountCents !== "number") {
    return error({
      traceId,
      error: "patientProfileId and amountCents are required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: scoped.value.scopeContext,
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "billing-invoices",
    traceId,
    patientProfileId: scoped.value.patientProfileId,
  });
  if (!access.ok) return access.response;

  const invoiceNumber = `INV-${Date.now()}`;

  const serviceClient = getSupabaseServiceClient();
  const { data, error: insertError } = await serviceClient
    .from("invoices")
    .insert({
      patient_profile_id: scoped.value.patientProfileId,
      invoice_number: invoiceNumber,
      amount_cents: Math.max(0, Math.floor(body.amountCents)),
      currency: body.currency?.trim() ?? "USD",
      status: "issued",
      due_at: body.dueAt ?? null,
      issued_at: new Date().toISOString(),
    })
    .select("id, invoice_number, amount_cents, currency, status, due_at, issued_at, updated_at")
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
    action: "billing.invoice.create",
    resourceType: "invoice",
    resourceId: data.id,
    traceId,
    scopeContext: scoped.value.scopeContext,
    metadata: redactedMetadata({
      amountCents: data.amount_cents,
      invoiceNumber: data.invoice_number,
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

