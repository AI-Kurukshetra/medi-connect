import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { appTheme, cx, themeLayoutClasses } from "@/theme";

type AuthMode = "sign-in" | "sign-up";

const shellCopy = {
  "sign-in": {
    switchHref: "/sign-up",
    switchLabel: "Create account",
    footerNote: "Secure access for patients and providers",
  },
  "sign-up": {
    switchHref: "/sign-in",
    switchLabel: "Sign in",
    footerNote: "Simple onboarding into the shared care workspace",
  },
} as const;

interface AuthShellProps {
  mode: AuthMode;
  children: ReactNode;
}

export function AuthShell({ mode, children }: AuthShellProps) {
  const content = shellCopy[mode];

  return (
    <main className={`auth-stage min-h-screen ${themeLayoutClasses.pageFrame}`}>
      <div className={cx(themeLayoutClasses.container, "flex min-h-[calc(100vh-2.5rem)] flex-col")}>
        <header className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[rgba(51,102,255,0.1)]">
              <Image
                src="/logo.png"
                alt={`${appTheme.brand.name} logo`}
                width={40}
                height={40}
                className="h-9 w-9 rounded-[12px] object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[-0.02em] text-[var(--foreground-strong)]">
                {appTheme.brand.name}
              </p>
              <p className="text-xs text-[var(--muted)]">{content.footerNote}</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground-strong)] sm:inline-flex"
            >
              Back to home
            </Link>
            <Link
              href={content.switchHref}
              className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[var(--brand)] px-4 text-sm font-semibold text-[var(--brand-contrast)] transition hover:bg-[var(--brand-deep)]"
            >
              {content.switchLabel}
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <div className="w-full max-w-[480px]">{children}</div>
        </div>

        <footer className="pb-3 pt-2 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
          <div className="flex items-center justify-center gap-3">
            <span>Privacy Policy</span>
            <span className="h-1 w-1 rounded-full bg-[rgba(115,128,156,0.4)]" />
            <span>Terms of Service</span>
            <span className="h-1 w-1 rounded-full bg-[rgba(115,128,156,0.4)]" />
            <span>Help Center</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
