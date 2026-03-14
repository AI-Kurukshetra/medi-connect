"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cx, themeClassNames } from "@/theme";

interface SignOutButtonProps {
  className?: string;
  children?: ReactNode;
}

export function SignOutButton({ className, children }: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(() => {
      void (async () => {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
        await fetch("/api/auth/session", { method: "DELETE" });
        router.replace("/sign-in");
        router.refresh();
      })();
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={cx(themeClassNames.secondaryButtonCompact, className)}
    >
      {isPending ? "Signing out..." : children ?? "Sign out"}
    </button>
  );
}
