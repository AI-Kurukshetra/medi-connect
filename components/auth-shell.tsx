import Link from "next/link";
import type { ReactNode } from "react";
import { cx, themeLayoutClasses } from "@/theme";

interface AuthShellProps {
  mode?: "sign-in" | "sign-up";
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {

  return (
    <main className={`auth-stage min-h-screen ${themeLayoutClasses.pageFrame}`}>
      <div className={cx(themeLayoutClasses.container, "flex min-h-[calc(100vh-2.5rem)] flex-col")}>
        <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <div className="w-full max-w-[480px]">{children}</div>
        </div>

        <footer className="pb-3 pt-2 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          <div className="flex items-center justify-center gap-3">
            <Link href="/privacy" className="transition hover:text-(--foreground-strong)">Privacy Policy</Link>
            <span className="h-1 w-1 rounded-full bg-[rgba(115,128,156,0.4)]" />
            <Link href="/terms" className="transition hover:text-(--foreground-strong)">Terms of Service</Link>
            <span className="h-1 w-1 rounded-full bg-[rgba(115,128,156,0.4)]" />
            <Link href="/support" className="transition hover:text-(--foreground-strong)">Help Center</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
