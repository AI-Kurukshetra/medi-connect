import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, ROLE_COOKIE } from "@/lib/auth/constants";
import { syncAuthProfile } from "@/lib/auth/profile-sync";
import { getSupabaseServerAuthClient } from "@/lib/supabase/server";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

interface SessionBody {
  accessToken?: string;
  role?: string;
  fullName?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as SessionBody;
  const accessToken = body.accessToken?.trim();

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token." }, { status: 400 });
  }

  const authClient = getSupabaseServerAuthClient();
  const { data, error } = await authClient.auth.getUser(accessToken);

  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid access token." }, { status: 401 });
  }

  const syncedProfile = await syncAuthProfile({
    user: data.user,
    roleHint: body.role,
    fullNameHint: body.fullName,
  });

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
  cookieStore.set(ROLE_COOKIE, syncedProfile.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  return NextResponse.json({ ok: true, role: syncedProfile.role });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(ROLE_COOKIE);
  return NextResponse.json({ ok: true });
}
