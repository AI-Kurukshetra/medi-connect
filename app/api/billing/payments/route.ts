import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getPaymentClient } from "@/lib/integrations/payments";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface PaymentBody {
  invoiceId?: string;
  method?: string;
}

export async function GET(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const invoiceId = new URL(request.url).searchParams.get("invoiceId");
  const serviceClient = getSupabaseServiceClient();

  if (invoiceId) {
    const { data: invoice } = await serviceClient
      .from("invoices")
      .select("id, patient_profile_id")
      .eq("id", invoiceId)
      .maybeSingle();
    if (!invoice) {
      return error({
        traceId,
        error: "Invoice not found.",
        status: 404,
        roleMode: auth.context.role,
        scopeContext: { patientProfileId: null, module: "billing-payments" },
      });
    }
    const access = await ensureResourceAccess({
      context: auth.context,
      module: "billing-payments",
      traceId,
      patientProfileId: invoice.patient_profile_id,
    });
    if (!access.ok) return access.response;
  }

  const { data, error: queryError } = await serviceClient
    .from("payments")
    .select("id, invoice_id, provider_ref, amount_cents, currency, method, status, reconciled_at, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (queryError) {
    return error({
      traceId,
      error: queryError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "billing-payments" },
    });
  }

  return ok({
    roleMode: auth.context.role,
    scopeContext: { patientProfileId: null, module: "billing-payments" },
    traceId,
    data: { items: data ?? [] },
  });
}

export async function POST(request: Request) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as PaymentBody;

  if (!body.invoiceId?.trim()) {
    return error({
      traceId,
      error: "invoiceId is required.",
      status: 422,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "billing-payments" },
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: invoice } = await serviceClient
    .from("invoices")
    .select("id, patient_profile_id, invoice_number, amount_cents, currency, status")
    .eq("id", body.invoiceId.trim())
    .maybeSingle();

  if (!invoice) {
    return error({
      traceId,
      error: "Invoice not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "billing-payments" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "billing-payments",
    traceId,
    patientProfileId: invoice.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const paymentClient = getPaymentClient();
  const charge = await paymentClient.charge({
    amountCents: invoice.amount_cents,
    currency: invoice.currency,
    invoiceNumber: invoice.invoice_number,
  });

  const { data, error: insertError } = await serviceClient
    .from("payments")
    .insert({
      invoice_id: invoice.id,
      provider_ref: charge.providerRef,
      amount_cents: invoice.amount_cents,
      currency: invoice.currency,
      method: body.method?.trim() ?? "card",
      status: charge.status,
      metadata: { adapterProvider: paymentClient.provider },
    })
    .select("id, invoice_id, provider_ref, amount_cents, currency, method, status, reconciled_at, created_at, updated_at")
    .single();

  if (insertError) {
    return error({
      traceId,
      error: insertError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: invoice.patient_profile_id,
        module: "billing-payments",
      },
    });
  }

  if (charge.status === "succeeded") {
    await serviceClient
      .from("invoices")
      .update({ status: "paid" })
      .eq("id", invoice.id);
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "billing.payment.create",
    resourceType: "payment",
    resourceId: data.id,
    traceId,
    scopeContext: {
      patientProfileId: invoice.patient_profile_id,
      module: "billing-payments",
    },
    metadata: redactedMetadata({
      paymentStatus: data.status,
      adapterProvider: paymentClient.provider,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: invoice.patient_profile_id,
      module: "billing-payments",
    },
    traceId,
    auditRef,
    status: 201,
    data: { item: data, adapterProvider: paymentClient.provider },
  });
}

