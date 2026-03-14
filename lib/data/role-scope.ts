import type { AuthContext } from "@/lib/auth/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export interface ScopedPatientResolution {
  patientProfileId: string | null;
  unauthorizedRequest: boolean;
  hasAssignments: boolean;
}

async function getProviderAssignedPatientIds(providerUserId: string) {
  const serviceClient = getSupabaseServiceClient();
  const { data } = await serviceClient
    .from("provider_patient_assignments")
    .select("patient_profile_id")
    .eq("provider_user_id", providerUserId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => row.patient_profile_id);
}

export async function canAccessPatientProfile(
  context: AuthContext,
  patientProfileId: string | null,
): Promise<boolean> {
  if (!patientProfileId) return false;

  if (context.role === "patient") {
    return context.patientProfileId === patientProfileId;
  }

  const assignedPatientIds = await getProviderAssignedPatientIds(context.userId);
  return assignedPatientIds.includes(patientProfileId);
}

export async function resolveScopedPatientProfile(
  context: AuthContext,
  requestedPatientProfileId?: string | null,
): Promise<ScopedPatientResolution> {
  if (context.role === "patient") {
    const ownId = context.patientProfileId;
    const unauthorizedRequest =
      Boolean(requestedPatientProfileId) &&
      Boolean(ownId) &&
      requestedPatientProfileId !== ownId;

    return {
      patientProfileId: ownId,
      unauthorizedRequest,
      hasAssignments: Boolean(ownId),
    };
  }

  const assignedPatientIds = await getProviderAssignedPatientIds(context.userId);

  if (assignedPatientIds.length === 0) {
    return {
      patientProfileId: null,
      unauthorizedRequest: Boolean(requestedPatientProfileId),
      hasAssignments: false,
    };
  }

  if (requestedPatientProfileId) {
    const isAssigned = assignedPatientIds.includes(requestedPatientProfileId);
    return {
      patientProfileId: isAssigned ? requestedPatientProfileId : null,
      unauthorizedRequest: !isAssigned,
      hasAssignments: true,
    };
  }

  return {
    patientProfileId: assignedPatientIds[0] ?? null,
    unauthorizedRequest: false,
    hasAssignments: true,
  };
}

export async function resolveScopedPatientProfileId(
  context: AuthContext,
  requestedPatientProfileId?: string | null,
): Promise<string | null> {
  const resolution = await resolveScopedPatientProfile(
    context,
    requestedPatientProfileId,
  );

  return resolution.patientProfileId;
}
