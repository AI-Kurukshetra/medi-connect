import { NextResponse } from "next/server";
import { getAuthContext, type AuthContext } from "@/lib/auth/server";

export async function requireApiAuthContext(): Promise<
  { ok: true; context: AuthContext } | { ok: false; response: NextResponse }
> {
  const context = await getAuthContext();

  if (!context) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized. Please sign in again." },
        { status: 401 },
      ),
    };
  }

  return { ok: true, context };
}

export function jsonValidationError(message: string, status = 422) {
  return NextResponse.json({ error: message }, { status });
}

