import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { StatusPill } from "@/components/status-pill";
import { appTheme, cx, themeClassNames, themeLayoutClasses } from "@/theme";

type AuthMode = "sign-in" | "sign-up";

const authContent = {
  "sign-in": {
    pill: "Member access",
    title: "Return to your care plan in one step.",
    description:
      "Sign in to continue medication onboarding, review reminders, and stay aligned with your care team.",
    helperTitle: "What happens after sign in",
    helperPoints: [
      "All users land on the same route map under /dashboard, /tasks, /adherence, and more.",
      "Patient and provider behavior changes inside each shared page based on role.",
      "The experience stays focused on care coordination, not workflow clutter.",
    ],
    flow: [
      "Open your account",
      "Enter shared post-login routes",
      "Review tasks, reminders, or follow-up",
    ],
    metrics: [
      {
        label: "Entry point",
        value: "Email only",
        detail: "Simple sign-in for the hackathon MVP.",
      },
      {
        label: "After access",
        value: "Shared URLs",
        detail: "One route map with role-aware rendering and actions.",
      },
    ],
  },
  "sign-up": {
    pill: "New account",
    title: "Create access, then move straight into the product.",
    description:
      "Start with the minimum details needed, choose patient or provider, and enter the MediConnect flow without extra setup steps.",
    helperTitle: "What happens after sign up",
    helperPoints: [
      "After registration, both roles land on /dashboard.",
      "Role controls what each shared module shows and allows.",
      "The form is intentionally short so the landing page carries most of the explanation.",
    ],
    flow: [
      "Create your account",
      "Choose your role",
      "Enter shared post-login modules",
    ],
    metrics: [
      {
        label: "Required fields",
        value: "Minimal",
        detail: "Name, email, password, and role selection.",
      },
      {
        label: "First destination",
        value: "Unified",
        detail: "Users go directly into /dashboard.",
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
              <p className={themeClassNames.text.eyebrow}>
                {appTheme.brand.name}
              </p>
              <p className={cx("text-sm", themeClassNames.text.body)}>
                {appTheme.brand.tagline}
              </p>
            </div>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className={themeClassNames.navLink}>
              Back to overview
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

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className={themeClassNames.authCard}>
            {children}
          </section>

          <section className="space-y-6">
            <div className={themeClassNames.heroCard}>
              <div className="mb-5 flex flex-wrap gap-3">
                <StatusPill tone="accent">{content.pill}</StatusPill>
                <StatusPill>Mobile-first auth</StatusPill>
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
                <p className={themeClassNames.text.eyebrow}>
                  {content.helperTitle}
                </p>
                <div className="mt-4 space-y-3">
                  {content.helperPoints.map((point) => (
                    <div key={point} className={themeClassNames.subtlePanel}>
                      <p className={themeClassNames.text.body}>{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={themeClassNames.authInfoCard}>
                <p className={themeClassNames.text.eyebrow}>Simple flow</p>
                <div className="mt-4 space-y-3">
                  {content.flow.map((step, index) => (
                    <div key={step} className={themeClassNames.subtlePanel}>
                      <p className={themeClassNames.text.label}>
                        Step 0{index + 1}
                      </p>
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
