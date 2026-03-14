import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { StatusPill } from "@/components/status-pill";
import { appTheme, cx, themeClassNames, themeLayoutClasses } from "@/theme";

type AuthMode = "sign-in" | "sign-up";

const authContent = {
  "sign-in": {
    pill: "Step 2 of 3",
    title: "Sign in and jump back into your care workspace.",
    description:
      "The landing page explains the product. This screen gets the user into the correct role-based dashboard with the fewest possible steps.",
    helperTitle: "What opens after sign in",
    helperPoints: [
      "Patients land on a simple dashboard with next steps, reminders, and support actions.",
      "Providers open the same workspace with review panels, blockers, and follow-up actions.",
      "Shared routes keep the demo easy to navigate on desktop and mobile.",
    ],
    flow: [
      "Confirm account access",
      "Open the shared dashboard shell",
      "Continue role-based care actions",
    ],
    metrics: [
      {
        label: "Auth style",
        value: "Fast",
        detail: "Email and password only for the MVP demo.",
      },
      {
        label: "Next page",
        value: "Dashboard",
        detail: "Every successful sign-in routes into the structured workspace.",
      },
    ],
  },
  "sign-up": {
    pill: "Step 2 of 3",
    title: "Create an account, choose your role, and enter the app.",
    description:
      "Registration stays intentionally small so the product story happens on the landing page and the real action starts inside the dashboard.",
    helperTitle: "What opens after sign up",
    helperPoints: [
      "Patients start with a calmer therapy dashboard focused on what happens next.",
      "Providers get a review workspace with care status, AI summaries, and outreach actions.",
      "One shared shell keeps the product feeling consistent across roles.",
    ],
    flow: [
      "Create your account",
      "Pick patient or provider",
      "Enter the shared dashboard shell",
    ],
    metrics: [
      {
        label: "Required info",
        value: "Minimal",
        detail: "Name, role, email, and password only.",
      },
      {
        label: "User journey",
        value: "Landing -> Auth -> Dashboard",
        detail: "The full structure is visible from the first screen onward.",
      },
    ],
  },
} as const;

interface AuthShellProps {
  mode: AuthMode;
  children: ReactNode;
}

export function AuthShell({ mode, children }: AuthShellProps) {
  const content = authContent[mode];

  return (
    <main className={`auth-stage min-h-screen ${themeLayoutClasses.pageFrame}`}>
      <div className={themeLayoutClasses.container}>
        <header className={themeClassNames.headerCard}>
          <Link href="/" className="flex items-center gap-3">
            <div className={themeClassNames.logoBadge}>
              <Image
                src="/logo.png"
                alt={`${appTheme.brand.name} logo`}
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl object-cover"
                priority
              />
            </div>
            <div>
              <p className={themeClassNames.text.eyebrow}>{appTheme.brand.name}</p>
              <p className={cx("text-sm", themeClassNames.text.body)}>
                {appTheme.brand.tagline}
              </p>
            </div>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className={themeClassNames.navLink}>
              Back to landing
            </Link>
            <Link
              href="/sign-in"
              className={
                mode === "sign-in"
                  ? themeClassNames.navLinkActive
                  : themeClassNames.navLink
              }
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className={
                mode === "sign-up"
                  ? themeClassNames.navLinkActive
                  : themeClassNames.navLink
              }
            >
              Create account
            </Link>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          <StatusPill tone="accent">Landing page first</StatusPill>
          <StatusPill>{content.pill}</StatusPill>
          <StatusPill>Role-based dashboard next</StatusPill>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className={themeClassNames.authCard}>{children}</section>

          <section className="space-y-6">
            <div className={themeClassNames.heroCard}>
              <div className="mb-5 flex flex-wrap gap-3">
                <StatusPill tone="accent">Structured auth flow</StatusPill>
                <StatusPill>Mobile-ready</StatusPill>
              </div>
              <h1 className={cx("max-w-3xl", themeClassNames.text.headingHero)}>
                {content.title}
              </h1>
              <p className={cx("mt-5 max-w-2xl", themeClassNames.text.bodyLarge)}>
                {content.description}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {content.metrics.map((metric) => (
                  <div key={metric.label} className={themeClassNames.metricTile}>
                    <p className={themeClassNames.text.label}>{metric.label}</p>
                    <p className={cx("mt-3", themeClassNames.text.headingMetric)}>
                      {metric.value}
                    </p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>
                      {metric.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className={themeClassNames.authInfoCard}>
                <p className={themeClassNames.text.eyebrow}>{content.helperTitle}</p>
                <div className="mt-4 space-y-3">
                  {content.helperPoints.map((point) => (
                    <div key={point} className={themeClassNames.subtlePanel}>
                      <p className={themeClassNames.text.body}>{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={themeClassNames.authInfoCard}>
                <p className={themeClassNames.text.eyebrow}>Flow check</p>
                <div className="mt-4 space-y-3">
                  {content.flow.map((step, index) => (
                    <div key={step} className={themeClassNames.subtlePanel}>
                      <p className={themeClassNames.text.label}>Step 0{index + 1}</p>
                      <p className={cx("mt-2", themeClassNames.text.bodyStrong)}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
