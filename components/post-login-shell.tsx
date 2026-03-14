import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { StatusPill } from "@/components/status-pill";
import { requireAuthContext, type AppRole } from "@/lib/auth/server";
import { appTheme, cx, themeClassNames, themeLayoutClasses } from "@/theme";

interface PostLoginShellProps {
  currentPath: string;
  children: ReactNode;
}

const sharedLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Overview, counts, and next actions.",
  },
  {
    href: "/tasks",
    label: "Tasks",
    description: "Checklist items and open blockers.",
  },
  {
    href: "/adherence",
    label: "Adherence",
    description: "Dose tracking and check-ins.",
  },
  {
    href: "/reminders",
    label: "Reminders",
    description: "Scheduled nudges and refill timing.",
  },
  {
    href: "/messages",
    label: "Messages",
    description: "Drafts, questions, and follow-up notes.",
  },
  {
    href: "/support",
    label: "Support",
    description: "Help the user understand what happens next.",
  },
] as const;

const roleLinks: Record<AppRole, ReadonlyArray<{ href: string; label: string; description: string }>> = {
  patient: [
    {
      href: "/assistance",
      label: "Medication help",
      description: "Guided support and assistance program info.",
    },
    {
      href: "/documents",
      label: "Documents",
      description: "Education, uploads, and shared files.",
    },
    {
      href: "/account",
      label: "Account",
      description: "Profile details and sign-out controls.",
    },
  ],
  provider: [
    {
      href: "/ai-insights",
      label: "AI insights",
      description: "Summaries, risk signals, and suggested follow-up.",
    },
    {
      href: "/prior-auth",
      label: "Care review",
      description: "Shared approvals and patient blocker status.",
    },
    {
      href: "/account",
      label: "Account",
      description: "Profile details and session controls.",
    },
  ],
};

const extraLinks: Record<AppRole, ReadonlyArray<{ href: string; label: string; description: string }>> = {
  patient: [
    {
      href: "/emergency",
      label: "Urgent support",
      description: "Escalation paths and emergency contact info.",
    },
  ],
  provider: [
    {
      href: "/documents",
      label: "Documents",
      description: "Shared files and patient materials.",
    },
    {
      href: "/ehr",
      label: "EHR links",
      description: "Connected patient summary views.",
    },
    {
      href: "/operations",
      label: "Operations",
      description: "Supporting shipment and inventory context.",
    },
    {
      href: "/billing",
      label: "Billing",
      description: "Secondary reimbursement and payment views.",
    },
    {
      href: "/emergency",
      label: "Urgent support",
      description: "Escalation workflows and contact coverage.",
    },
  ],
};

const rolePanels = {
  patient: {
    title: "Patient panel",
    description:
      "Keep the medication journey small, visible, and easy to act on from one dashboard shell.",
    points: [
      "See the next therapy step immediately.",
      "Track reminders, doses, and refill timing.",
      "Ask for help without hunting through documents.",
    ],
    ctaHref: "/support",
    ctaLabel: "Open support",
  },
  provider: {
    title: "Provider panel",
    description:
      "Review the patient story quickly, then decide the next outreach or follow-up action.",
    points: [
      "Check blockers and adherence at a glance.",
      "Open AI summaries without losing human control.",
      "Move from review to outreach in one workspace.",
    ],
    ctaHref: "/ai-insights",
    ctaLabel: "Open AI insights",
  },
} as const;

function isActivePath(currentPath: string, href: string) {
  return href === "/dashboard" ? currentPath === href : currentPath.startsWith(href);
}

function DashboardLink({
  currentPath,
  href,
  label,
  description,
}: {
  currentPath: string;
  href: string;
  label: string;
  description: string;
}) {
  const isActive = isActivePath(currentPath, href);

  return (
    <Link
      href={href}
      className={cx(
        "block rounded-[24px] border p-4 transition",
        isActive
          ? "border-transparent bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] text-[var(--brand-contrast)] shadow-[0_20px_44px_-28px_var(--shadow-strong)]"
          : "border-[var(--card-border)] bg-[var(--button-secondary)] text-[var(--foreground-strong)] hover:bg-[var(--button-secondary-hover)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-[-0.02em]">{label}</p>
          <p
            className={cx(
              "mt-1 text-sm leading-6",
              isActive ? "text-[var(--brand-contrast-muted)]" : "text-[var(--muted)]",
            )}
          >
            {description}
          </p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Go
        </span>
      </div>
    </Link>
  );
}

export async function PostLoginShell({ currentPath, children }: PostLoginShellProps) {
  const context = await requireAuthContext();
  const firstName = context.fullName.split(" ")[0] ?? context.fullName;
  const rolePanel = rolePanels[context.role];

  return (
    <div className={themeLayoutClasses.pageFrame}>
      <div className={themeLayoutClasses.container}>
        <header className={themeClassNames.headerCard}>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3">
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
                  Structured care coordination workspace
                </p>
              </div>
            </Link>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="accent">Signed in</StatusPill>
              <StatusPill>{context.role} view</StatusPill>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="rounded-full border border-[var(--card-border)] bg-[var(--card-subtle)] px-4 py-2 text-sm text-[var(--foreground-strong)]">
              <span className="font-semibold">{firstName}</span>
              <span className="text-[var(--muted)]"> · {context.role}</span>
            </div>
            <Link href="/account" className={themeClassNames.navLink}>
              Account
            </Link>
            <SignOutButton />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
            <section className={themeClassNames.sectionCard}>
              <p className={themeClassNames.text.eyebrow}>Workspace structure</p>
              <h2 className={cx("mt-3", themeClassNames.text.headingPanel)}>
                Header, sidebar, and role-aware panels.
              </h2>
              <p className={cx("mt-3", themeClassNames.text.body)}>
                This shell keeps the main demo flow consistent after sign-in, with the same layout for both roles.
              </p>
              <div className="mt-5 space-y-2">
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>1. Dashboard shell</p>
                  <p className={cx("mt-1", themeClassNames.text.body)}>
                    Branded header with account controls.
                  </p>
                </div>
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>2. Shared navigation</p>
                  <p className={cx("mt-1", themeClassNames.text.body)}>
                    Core care routes stay visible in the sidebar.
                  </p>
                </div>
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>3. Role panel</p>
                  <p className={cx("mt-1", themeClassNames.text.body)}>
                    Extra actions change for patients and providers.
                  </p>
                </div>
              </div>
            </section>

            <section className={themeClassNames.sectionCard}>
              <p className={themeClassNames.text.eyebrow}>Shared care flow</p>
              <div className="mt-4 space-y-3">
                {sharedLinks.map((link) => (
                  <DashboardLink key={link.href} currentPath={currentPath} {...link} />
                ))}
              </div>
            </section>

            <section className={themeClassNames.sectionCard}>
              <p className={themeClassNames.text.eyebrow}>
                {context.role === "provider" ? "Provider tools" : "Patient tools"}
              </p>
              <div className="mt-4 space-y-3">
                {roleLinks[context.role].map((link) => (
                  <DashboardLink key={link.href} currentPath={currentPath} {...link} />
                ))}
              </div>
            </section>

            <section className={themeClassNames.sectionCard}>
              <p className={themeClassNames.text.eyebrow}>Extended workspace</p>
              <div className="mt-4 space-y-3">
                {extraLinks[context.role].map((link) => (
                  <DashboardLink key={link.href} currentPath={currentPath} {...link} />
                ))}
              </div>
            </section>

            <section className={themeClassNames.darkPanel}>
              <p className={themeClassNames.text.onDarkLabel}>{rolePanel.title}</p>
              <h2 className={cx("mt-3", themeClassNames.text.onDarkHero)}>
                Role-wise panel content stays focused.
              </h2>
              <p className={cx("mt-3", themeClassNames.text.onDarkBody)}>
                {rolePanel.description}
              </p>
              <div className="mt-5 space-y-3">
                {rolePanel.points.map((point) => (
                  <div
                    key={point}
                    className="rounded-[20px] border border-white/12 bg-white/8 p-4"
                  >
                    <p className={themeClassNames.text.onDarkBody}>{point}</p>
                  </div>
                ))}
              </div>
              <Link href={rolePanel.ctaHref} className={cx("mt-5", themeClassNames.secondaryButtonCompact)}>
                {rolePanel.ctaLabel}
              </Link>
            </section>
          </aside>

          <main className={themeLayoutClasses.main}>{children}</main>
        </div>
      </div>
    </div>
  );
}
