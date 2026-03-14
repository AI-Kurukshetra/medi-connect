import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { StatusPill } from "@/components/status-pill";
import { requireAuthContext, type AppRole } from "@/lib/auth/server";
import { patientJourney } from "@/lib/mock-data";
import { appTheme, cx, themeClassNames, themeLayoutClasses } from "@/theme";

interface PostLoginShellProps {
  currentPath: string;
  children: ReactNode;
}

interface SidebarItem {
  href: string;
  label: string;
  description: string;
  token: string;
}

const primaryRoutes: SidebarItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Overview, stats, and next actions.",
    token: "DB",
  },
  {
    href: "/tasks",
    label: "Tasks",
    description: "Checklist items and blockers.",
    token: "TS",
  },
  {
    href: "/adherence",
    label: "Adherence",
    description: "Dose tracking and follow-up notes.",
    token: "AD",
  },
  {
    href: "/reminders",
    label: "Reminders",
    description: "Scheduled nudges and refill timing.",
    token: "RM",
  },
  {
    href: "/messages",
    label: "Messages",
    description: "Drafted outreach and care questions.",
    token: "MS",
  },
];

const accountRoutes: SidebarItem[] = [
  {
    href: "/support",
    label: "Support",
    description: "Ask what happens next and get guided help.",
    token: "SP",
  },
  {
    href: "/account",
    label: "Account",
    description: "Profile details and session controls.",
    token: "AC",
  },
  {
    href: "/documents",
    label: "Documents",
    description: "Education, uploads, and shared materials.",
    token: "DC",
  },
];

const roleRoutes: Record<AppRole, SidebarItem[]> = {
  patient: [
    {
      href: "/assistance",
      label: "Patient panel",
      description: "Medication help, assistance programs, and care clarity.",
      token: "PT",
    },
    {
      href: "/emergency",
      label: "Urgent support",
      description: "Emergency contacts and escalation paths.",
      token: "UR",
    },
  ],
  provider: [
    {
      href: "/ai-insights",
      label: "Provider panel",
      description: "AI summaries, risk signals, and suggested follow-up.",
      token: "PR",
    },
    {
      href: "/prior-auth",
      label: "Care review",
      description: "Authorization status and patient blockers.",
      token: "CR",
    },
  ],
};

const extendedRoutes: Record<AppRole, SidebarItem[]> = {
  patient: [
    {
      href: "/ai-insights",
      label: "AI insights",
      description: "Review explainable guidance and drafts.",
      token: "AI",
    },
  ],
  provider: [
    {
      href: "/ehr",
      label: "EHR links",
      description: "Connected patient summary views.",
      token: "EH",
    },
    {
      href: "/operations",
      label: "Operations",
      description: "Logistics and shipment context.",
      token: "OP",
    },
    {
      href: "/billing",
      label: "Billing",
      description: "Financial workflow and reconciliation.",
      token: "BL",
    },
    {
      href: "/emergency",
      label: "Urgent support",
      description: "Escalation coverage and safety response.",
      token: "UR",
    },
  ],
};

const rolePanelContent = {
  patient: {
    title: "Patient panel",
    description:
      "Everything the patient needs stays close: next steps, support, reminders, and simple language.",
    points: [
      patientJourney.aiInsights[0]?.summary ?? "Review your next medication steps in plain language.",
      patientJourney.messageDraft.subject,
      `Refill planning in ${patientJourney.medication.refillDueInDays} days.`,
    ],
    ctaHref: "/support",
    ctaLabel: "Open support",
  },
  provider: {
    title: "Provider panel",
    description:
      "Review, outreach, and risk context stay visible without overwhelming the dashboard.",
    points: [
      patientJourney.providerSummary.adherenceTrend,
      patientJourney.providerSummary.recommendedAction,
      `Assigned patient: ${patientJourney.patient.name}.`,
    ],
    ctaHref: "/ai-insights",
    ctaLabel: "Open AI insights",
  },
} as const;

function isActivePath(currentPath: string, href: string) {
  return href === "/dashboard" ? currentPath === href : currentPath.startsWith(href);
}

function SidebarRouteLink({
  currentPath,
  item,
}: {
  currentPath: string;
  item: SidebarItem;
}) {
  const isActive = isActivePath(currentPath, item.href);

  return (
    <Link
      href={item.href}
      className={isActive ? themeClassNames.sidebarLinkActive : themeClassNames.sidebarLink}
    >
      <div
        className={cx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] text-xs font-semibold uppercase tracking-[0.18em]",
          isActive
            ? "bg-white/12 text-[var(--brand-contrast)]"
            : "bg-[rgba(25,75,85,0.08)] text-[var(--brand)]",
        )}
      >
        {item.token}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-[-0.02em]">{item.label}</p>
        <p
          className={cx(
            "mt-1 text-sm leading-6",
            isActive ? "text-[var(--brand-contrast-muted)]" : "text-[var(--muted)]",
          )}
        >
          {item.description}
        </p>
      </div>
    </Link>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={themeClassNames.sidebarCard}>
      <p className={themeClassNames.text.eyebrow}>{title}</p>
      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}

export async function PostLoginShell({ currentPath, children }: PostLoginShellProps) {
  const context = await requireAuthContext();
  const firstName = context.fullName.split(" ")[0] ?? context.fullName;
  const rolePanel = rolePanelContent[context.role];

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
                  className="h-10 w-10 rounded-[18px] object-cover"
                  priority
                />
              </div>
              <div>
                <p className={themeClassNames.text.eyebrow}>{appTheme.brand.name}</p>
                <p className={cx("text-sm", themeClassNames.text.body)}>
                  Structured care workspace
                </p>
              </div>
            </Link>

            <div className="flex flex-wrap gap-2">
              <StatusPill tone="accent">Signed in</StatusPill>
              <StatusPill>{context.role} mode</StatusPill>
              <StatusPill>Sidebar workspace</StatusPill>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className={themeClassNames.workspaceStrip}>
              <span className="text-sm font-semibold text-[var(--foreground-strong)]">
                {firstName}
              </span>
              <span className="text-sm text-[var(--muted)]"> · {context.role}</span>
            </div>
            <Link href="/support" className={themeClassNames.navLink}>
              Support
            </Link>
            <Link href="/account" className={themeClassNames.navLink}>
              Account
            </Link>
            <SignOutButton />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
            <section className={themeClassNames.darkPanel}>
              <p className={themeClassNames.text.onDarkLabel}>Care snapshot</p>
              <h2 className={cx("mt-3", themeClassNames.text.onDarkHero)}>
                {context.role === "provider"
                  ? `Reviewing ${patientJourney.patient.name}`
                  : `Welcome, ${firstName}`}
              </h2>
              <p className={cx("mt-3", themeClassNames.text.onDarkBody)}>
                {patientJourney.profile.therapyStatus}
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-[20px] border border-white/12 bg-white/8 p-4">
                  <p className={themeClassNames.text.onDarkLabel}>Condition</p>
                  <p className={cx("mt-1", themeClassNames.text.onDarkBody)}>
                    {patientJourney.profile.condition}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/12 bg-white/8 p-4">
                  <p className={themeClassNames.text.onDarkLabel}>Next follow-up</p>
                  <p className={cx("mt-1", themeClassNames.text.onDarkBody)}>
                    {patientJourney.profile.nextAppointmentAt}
                  </p>
                </div>
              </div>
            </section>

            <SidebarSection title="Core workspace">
              {primaryRoutes.map((item) => (
                <SidebarRouteLink key={item.href} currentPath={currentPath} item={item} />
              ))}
            </SidebarSection>

            <SidebarSection title="Support and account">
              {accountRoutes.map((item) => (
                <SidebarRouteLink key={item.href} currentPath={currentPath} item={item} />
              ))}
            </SidebarSection>

            <SidebarSection title={context.role === "provider" ? "Provider tools" : "Patient tools"}>
              {roleRoutes[context.role].map((item) => (
                <SidebarRouteLink key={item.href} currentPath={currentPath} item={item} />
              ))}
            </SidebarSection>

            <SidebarSection title="Everything else">
              {extendedRoutes[context.role].map((item) => (
                <SidebarRouteLink key={item.href} currentPath={currentPath} item={item} />
              ))}
            </SidebarSection>

            <section className={themeClassNames.sidebarCard}>
              <p className={themeClassNames.text.eyebrow}>{rolePanel.title}</p>
              <h2 className={cx("mt-3", themeClassNames.text.headingPanel)}>
                Role-wise guidance stays inside the sidebar.
              </h2>
              <p className={cx("mt-3", themeClassNames.text.body)}>{rolePanel.description}</p>
              <div className="mt-4 space-y-3">
                {rolePanel.points.map((point) => (
                  <div key={point} className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.body}>{point}</p>
                  </div>
                ))}
              </div>
              <Link href={rolePanel.ctaHref} className={cx("mt-5", themeClassNames.primaryButtonCompact)}>
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
