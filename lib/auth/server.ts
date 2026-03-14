import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE, ROLE_COOKIE } from "@/lib/auth/constants";
import { getSupabaseServerAuthClient, getSupabaseServiceClient } from "@/lib/supabase/server";

export type AppRole = "patient" | "provider";

export interface AuthContext {
  accessToken: string;
  userId: string;
  role: AppRole;
  fullName: string;
  patientProfileId: string | null;
}

function normalizeRole(value: unknown): AppRole {
  return value === "provider" ? "provider" : "patient";
}

function resolveRole(...values: unknown[]): AppRole {
  for (const value of values) {
    if (value === "provider" || value === "patient") {
      return normalizeRole(value);
    }
  }

  return "patient";
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const persistedRole = cookieStore.get(ROLE_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const authClient = getSupabaseServerAuthClient();
  const { data: authData, error: authError } = await authClient.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return null;
  }

  const serviceClient = getSupabaseServiceClient();

  const [{ data: profile }, { data: patientProfile }] = await Promise.all([
    serviceClient
      .from("profiles")
      .select("role, full_name")
      .eq("id", authData.user.id)
      .maybeSingle(),
    serviceClient
      .from("patient_profiles")
      .select("id")
      .eq("user_id", authData.user.id)
      .maybeSingle(),
  ]);

  const role = resolveRole(profile?.role, authData.user.user_metadata?.role, persistedRole);

  let patientProfileId = patientProfile?.id ?? null;

  // Auto-create patient_profiles row for patients who signed up before the
  // trigger migration was applied (or if the trigger silently failed).
  if (role === "patient" && !patientProfileId) {
    const { data: created } = await serviceClient
      .from("patient_profiles")
      .upsert(
        {
          user_id: authData.user.id,
          condition_name: "Needs intake review",
          therapy_status: "Getting started",
        },
        { onConflict: "user_id" },
      )
      .select("id")
      .single();

    patientProfileId = created?.id ?? null;
  }

  return {
    accessToken,
    userId: authData.user.id,
    role,
    fullName: profile?.full_name ?? authData.user.user_metadata?.full_name ?? "MediConnect user",
    patientProfileId,
  };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context) {
    redirect("/sign-in");
  }

  return context;
}
