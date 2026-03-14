"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cx, themeClassNames } from "@/theme";

export function SignOutButton() {
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
      className={cx(themeClassNames.secondaryButtonCompact)}
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}

