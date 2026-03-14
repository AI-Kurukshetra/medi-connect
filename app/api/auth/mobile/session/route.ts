import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import { getSupabaseServerAuthClient } from "@/lib/supabase/server";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

interface MobileSessionBody {
  accessToken?: string;
  deviceId?: string;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  return NextResponse.json({
    contractVersion: "2026-03-14",
    hasSession: Boolean(token),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as MobileSessionBody;
  const accessToken = body.accessToken?.trim();

  if (!accessToken) {
    return NextResponse.json(
      {
        contractVersion: "2026-03-14",
        error: "Missing accessToken.",
      },
      { status: 400 },
    );
  }

  const authClient = getSupabaseServerAuthClient();
  const { data, error } = await authClient.auth.getUser(accessToken);

  if (error || !data.user) {
    return NextResponse.json(
      {
        contractVersion: "2026-03-14",
        error: "Invalid accessToken.",
      },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  return NextResponse.json({
    contractVersion: "2026-03-14",
    deviceId: body.deviceId ?? null,
    sessionBound: true,
    userId: data.user.id,
  });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  return NextResponse.json({
    contractVersion: "2026-03-14",
    sessionBound: false,
  });
}

