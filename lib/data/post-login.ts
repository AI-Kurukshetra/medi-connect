import type { AuthContext } from "@/lib/auth/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { resolveScopedPatientProfileId } from "@/lib/data/role-scope";

export async function getScopedPatientProfile(context: AuthContext) {
  const patientProfileId = await resolveScopedPatientProfileId(context);
  if (!patientProfileId) return null;

  const serviceClient = getSupabaseServiceClient();
  const { data } = await serviceClient
    .from("patient_profiles")
    .select("id, condition_name, therapy_status, next_appointment_at")
    .eq("id", patientProfileId)
    .maybeSingle();

  return data ?? null;
}

export async function getDashboardCounts(context: AuthContext) {
  const patientProfileId = await resolveScopedPatientProfileId(context);
  if (!patientProfileId) {
    return {
      patientProfileId: null,
      taskCount: 0,
      adherenceCount: 0,
      reminderCount: 0,
      messageCount: 0,
    };
  }

  const serviceClient = getSupabaseServiceClient();
  const [tasks, adherence, reminders, messages] = await Promise.all([
    serviceClient
      .from("care_tasks")
      .select("id", { count: "exact", head: true })
      .eq("patient_profile_id", patientProfileId),
    serviceClient
      .from("adherence_check_ins")
      .select("id", { count: "exact", head: true })
      .eq("patient_profile_id", patientProfileId),
    serviceClient
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .eq("patient_profile_id", patientProfileId),
    serviceClient
      .from("message_drafts")
      .select("id", { count: "exact", head: true })
      .eq("patient_profile_id", patientProfileId),
  ]);

  return {
    patientProfileId,
    taskCount: tasks.count ?? 0,
    adherenceCount: adherence.count ?? 0,
    reminderCount: reminders.count ?? 0,
    messageCount: messages.count ?? 0,
  };
}

