import type { Metadata } from "next";
import Link from "next/link";
import { PostLoginShell } from "@/components/post-login-shell";
import { RoleAwareEmptyState } from "@/components/role-aware-empty-state";
import { SectionCard } from "@/components/section-card";
import { SignOutButton } from "@/components/sign-out-button";
import { StatusPill } from "@/components/status-pill";
import { requireAuthContext } from "@/lib/auth/server";
import { getDashboardCounts, getScopedPatientProfile } from "@/lib/data/post-login";
import { cx, themeClassNames } from "@/theme";

export const metadata: Metadata = {
  title: "Dashboard",
  alternates: { canonical: "/dashboard" },
};

export default async function DashboardPage() {
  const context = await requireAuthContext();
  const [profile, counts] = await Promise.all([
    getScopedPatientProfile(context),
    getDashboardCounts(context),
  ]);

  return (
    <PostLoginShell currentPath="/dashboard">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow={`${context.role} dashboard`}
          title={`Welcome back, ${context.fullName.split(" ")[0]}`}
          description={
            context.role === "provider"
              ? "Shared routes are active. Provider actions are scoped by role and entity."
              : "Your therapy workflow is now under one shared route map."
          }
        >
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusPill tone="accent">{context.role} mode</StatusPill>
            <StatusPill>Shared post-login route map</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Tasks</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {counts.taskCount}
              </p>
            </div>
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Adherence</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {counts.adherenceCount}
              </p>
            </div>
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Reminders</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {counts.reminderCount}
              </p>
            </div>
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Messages</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {counts.messageCount}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Account actions" title="Session controls">
          <p className={themeClassNames.text.body}>
            Sign out clears browser auth and the secure server cookie used for shared route guards.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/account" className={themeClassNames.primaryButtonCompact}>
              Open account
            </Link>
            <SignOutButton />
          </div>
        </SectionCard>
      </section>

      {profile ? (
        <SectionCard
          eyebrow="Scoped patient profile"
          title={profile.condition_name}
          description={`Therapy status: ${profile.therapy_status}`}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/tasks" className={themeClassNames.secondaryButtonCompact}>
              Manage tasks
            </Link>
            <Link href="/adherence" className={themeClassNames.secondaryButtonCompact}>
              Check adherence
            </Link>
            <Link href="/messages" className={themeClassNames.secondaryButtonCompact}>
              Review drafts
            </Link>
          </div>
        </SectionCard>
      ) : (
        <RoleAwareEmptyState
          roleMode={context.role}
          title="No patient profile linked yet"
          description={
            context.role === "provider"
              ? "Provider mode is active but there is no scoped patient profile yet."
              : "Patient mode is active but your profile setup is incomplete."
          }
          ctaHref="/account"
          ctaLabel="Open account settings"
        />
      )}
    </PostLoginShell>
  );
}

