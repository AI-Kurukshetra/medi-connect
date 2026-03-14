import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getPaymentClient } from "@/lib/integrations/payments";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  if (auth.context.role !== "provider") {
    return error({
      traceId,
      error: "Only providers can reconcile payments.",
      status: 403,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "billing-reconcile" },
    });
  }
  const { id } = await params;

  const serviceClient = getSupabaseServiceClient();
  const { data: payment } = await serviceClient
    .from("payments")
    .select("id, invoice_id, provider_ref, status")
    .eq("id", id)
    .maybeSingle();

  if (!payment) {
    return error({
      traceId,
      error: "Payment not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "billing-reconcile" },
    });
  }

  const { data: invoice } = await serviceClient
    .from("invoices")
    .select("id, patient_profile_id")
    .eq("id", payment.invoice_id)
    .maybeSingle();

  if (!invoice) {
    return error({
      traceId,
      error: "Invoice not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "billing-reconcile" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "billing-reconcile",
    traceId,
    patientProfileId: invoice.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const paymentClient = getPaymentClient();
  const reconciliation = await paymentClient.reconcile(payment.provider_ref);
  const nextStatus = reconciliation === "reconciled" ? "reconciled" : payment.status;

  const { data, error: updateError } = await serviceClient
    .from("payments")
    .update({
      status: nextStatus,
      reconciled_at:
        nextStatus === "reconciled" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("id, invoice_id, provider_ref, amount_cents, currency, method, status, reconciled_at, updated_at")
    .single();

  if (updateError) {
    return error({
      traceId,
      error: updateError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: invoice.patient_profile_id,
        module: "billing-reconcile",
      },
    });
  }

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "billing.payment.reconcile",
    resourceType: "payment",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: invoice.patient_profile_id,
      module: "billing-reconcile",
    },
    metadata: redactedMetadata({
      previousStatus: payment.status,
      nextStatus,
      adapterProvider: paymentClient.provider,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: invoice.patient_profile_id,
      module: "billing-reconcile",
    },
    traceId,
    auditRef,
    data: {
      item: data,
      reconciliation,
      adapterProvider: paymentClient.provider,
    },
  });
}

