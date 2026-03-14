import type { User } from "@supabase/supabase-js";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export type AuthSyncRole = "patient" | "provider";

interface SyncAuthProfileParams {
  user: User;
  roleHint?: string | null;
  fullNameHint?: string | null;
}

function normalizeRole(value: unknown): AuthSyncRole {
  return value === "provider" ? "provider" : "patient";
}

function normalizeFullName(user: User, fullNameHint?: string | null) {
  const candidate =
    fullNameHint?.trim() ||
    user.user_metadata?.full_name?.toString().trim() ||
    user.email?.split("@")[0]?.trim() ||
    "MediConnect user";

  return candidate || "MediConnect user";
}

export async function ensurePatientProfile(userId: string) {
  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("patient_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const { data: created } = await serviceClient
    .from("patient_profiles")
    .upsert(
      {
        user_id: userId,
        condition_name: "Needs intake review",
        therapy_status: "Getting started",
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();

  return created?.id ?? null;
}

export async function syncAuthProfile({
  user,
  roleHint,
  fullNameHint,
}: SyncAuthProfileParams) {
  const serviceClient = getSupabaseServiceClient();
  const resolvedRole = normalizeRole(roleHint ?? user.user_metadata?.role);
  const fullName = normalizeFullName(user, fullNameHint);

  await serviceClient.from("profiles").upsert(
    {
      id: user.id,
      role: resolvedRole,
      full_name: fullName,
    },
    { onConflict: "id" },
  );

  if (resolvedRole === "patient") {
    await ensurePatientProfile(user.id);
  }

  return {
    role: resolvedRole,
    fullName,
  };
}
