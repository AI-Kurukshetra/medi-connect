import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
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

export async function getAuthContext(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

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

  const role = normalizeRole(profile?.role ?? authData.user.user_metadata?.role);

  return {
    accessToken,
    userId: authData.user.id,
    role,
    fullName: profile?.full_name ?? authData.user.user_metadata?.full_name ?? "MediConnect user",
    patientProfileId: patientProfile?.id ?? null,
  };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context) {
    redirect("/sign-in");
  }

  return context;
}
