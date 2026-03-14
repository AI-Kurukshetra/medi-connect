import { error, ok, resolveTraceId } from "@/lib/api/envelope";
import { ensureResourceAccess } from "@/lib/api/patient-scope";
import { createAuditEvent, redactedMetadata } from "@/lib/audit/events";
import { requireApiAuthContext } from "@/lib/auth/api";
import { getNotificationClient } from "@/lib/integrations/notifications";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface EscalationBody {
  channel?: "sms" | "email" | "in-app";
  recipient?: string;
  note?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const traceId = resolveTraceId(request);
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = (await request.json()) as EscalationBody;

  const serviceClient = getSupabaseServiceClient();
  const { data: incident } = await serviceClient
    .from("escalation_incidents")
    .select("id, patient_profile_id, severity, status, summary")
    .eq("id", id)
    .maybeSingle();

  if (!incident) {
    return error({
      traceId,
      error: "Incident not found.",
      status: 404,
      roleMode: auth.context.role,
      scopeContext: { patientProfileId: null, module: "emergency-escalate" },
    });
  }

  const access = await ensureResourceAccess({
    context: auth.context,
    module: "emergency-escalate",
    traceId,
    patientProfileId: incident.patient_profile_id,
  });
  if (!access.ok) return access.response;

  const nextStatus = incident.status === "closed" ? "closed" : "escalated";
  const escalationTime = new Date().toISOString();

  const { data: updated, error: updateError } = await serviceClient
    .from("escalation_incidents")
    .update({
      status: nextStatus,
      escalated_at: nextStatus === "escalated" ? escalationTime : null,
    })
    .eq("id", id)
    .select("id, severity, status, summary, escalated_at, updated_at")
    .single();

  if (updateError) {
    return error({
      traceId,
      error: updateError.message,
      status: 500,
      roleMode: auth.context.role,
      scopeContext: {
        patientProfileId: incident.patient_profile_id,
        module: "emergency-escalate",
      },
    });
  }

  const notificationClient = getNotificationClient();
  const notification = await notificationClient.send({
    channel: body.channel ?? "in-app",
    recipient: body.recipient ?? auth.context.fullName,
    message: `Escalation incident ${id}: ${incident.summary}${body.note ? ` | ${body.note}` : ""}`,
  });

  const auditRef = await createAuditEvent({
    context: auth.context,
    action: "emergency.incident.escalate",
    resourceType: "escalation_incident",
    resourceId: id,
    traceId,
    scopeContext: {
      patientProfileId: incident.patient_profile_id,
      module: "emergency-escalate",
    },
    metadata: redactedMetadata({
      notificationProvider: notificationClient.provider,
      notificationStatus: notification.status,
      nextStatus: updated.status,
    }),
  });

  return ok({
    roleMode: auth.context.role,
    scopeContext: {
      patientProfileId: incident.patient_profile_id,
      module: "emergency-escalate",
    },
    traceId,
    auditRef,
    data: {
      incident: updated,
      notification,
      adapterProvider: notificationClient.provider,
    },
  });
}

