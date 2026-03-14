import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { getSupabaseServerAuthClient } from "@/lib/supabase/server";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

interface SessionBody {
  accessToken?: string;
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

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  return NextResponse.json({ ok: true });
}
