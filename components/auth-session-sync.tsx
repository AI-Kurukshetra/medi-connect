"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const publicRoutes = new Set(["/", "/sign-in", "/sign-up"]);
const authRoutes = new Set(["/sign-in", "/sign-up"]);

async function bindServerSession(session: Session | null) {
  if (!session?.access_token) {
    await fetch("/api/auth/session", { method: "DELETE" });
    return { changed: true, role: null };
  }

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessToken: session.access_token,
      role: session.user.user_metadata?.role ?? null,
      fullName: session.user.user_metadata?.full_name ?? null,
    }),
  });

  if (!response.ok) {
    return { changed: false, role: null };
  }

  const payload = (await response.json()) as {
    ok?: boolean;
    role?: "patient" | "provider";
  };

  return {
    changed: true,
    role: payload.role ?? null,
  };
}

export function AuthSessionSync() {
  const router = useRouter();
  const pathname = usePathname();
  const lastTokenRef = useRef<string | null>(null);
  const lastRoleRef = useRef<string | null>(null);
  const hasBootstrappedRef = useRef(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function syncSession(session: Session | null, shouldRefresh: boolean) {
      const nextToken = session?.access_token ?? null;
      const nextRole = session?.user.user_metadata?.role?.toString() ?? null;

      const isSameToken = lastTokenRef.current === nextToken;
      const isSameRole = lastRoleRef.current === nextRole;

      if (hasBootstrappedRef.current && isSameToken && isSameRole) {
        return;
      }

      lastTokenRef.current = nextToken;
      lastRoleRef.current = nextRole;
      hasBootstrappedRef.current = true;

      const result = await bindServerSession(session);

      if (!shouldRefresh) {
        if (session && authRoutes.has(pathname)) {
          router.replace("/dashboard");
          router.refresh();
        }
        return;
      }

      if (!session && !publicRoutes.has(pathname)) {
        router.refresh();
        return;
      }

      if (session && authRoutes.has(pathname)) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      if (session && result.changed) {
        router.refresh();
      }
    }

    void supabase.auth.getSession().then(({ data }) => syncSession(data.session, false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const shouldRefresh =
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "USER_UPDATED" ||
        event === "INITIAL_SESSION";

      void syncSession(session, shouldRefresh);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
