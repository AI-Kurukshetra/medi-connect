import type { Metadata } from "next";
import Link from "next/link";
import { PostLoginShell } from "@/components/post-login-shell";
import { RoleAwareEmptyState } from "@/components/role-aware-empty-state";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { requireAuthContext } from "@/lib/auth/server";
import { getDashboardCounts, getScopedPatientProfile } from "@/lib/data/post-login";
import { patientJourney } from "@/lib/mock-data";
import { cx, themeClassNames } from "@/theme";

export const metadata: Metadata = {
  title: "Dashboard",
  alternates: { canonical: "/dashboard" },
};

const countCards = [
  { key: "taskCount", label: "Tasks", hint: "Checklist items in motion" },
  { key: "adherenceCount", label: "Adherence", hint: "Dose events and check-ins" },
  { key: "reminderCount", label: "Reminders", hint: "Upcoming nudges and refill timing" },
  { key: "messageCount", label: "Messages", hint: "Open drafts and follow-up notes" },
] as const;

export default async function DashboardPage() {
  const context = await requireAuthContext();
  const [profile, counts] = await Promise.all([
    getScopedPatientProfile(context),
    getDashboardCounts(context),
  ]);

  const firstName = context.fullName.split(" ")[0] ?? context.fullName;
  const dashboardContent =
    context.role === "provider"
      ? {
          eyebrow: "Provider control center",
          title: `Welcome back, ${firstName}`,
          description:
            "Use this dashboard to review blockers, move through shared modules, and take the next provider action without losing context.",
          tone: "warning" as const,
          heroPoints: patientJourney.providerSummary.blockers,
          quickLinks: [
            { href: "/ai-insights", label: "Open AI insights" },
            { href: "/messages", label: "Review messages" },
            { href: "/prior-auth", label: "Check care review" },
          ],
          laneTitle: "Provider panel",
          laneDescription: patientJourney.providerSummary.recommendedAction,
          laneItems: [
            patientJourney.providerSummary.adherenceTrend,
            patientJourney.providerSummary.note,
            `Assigned patient: ${patientJourney.patient.name}`,
          ],
        }
      : {
          eyebrow: "Patient control center",
          title: `Welcome back, ${firstName}`,
          description:
            "Your dashboard keeps medication guidance, reminders, support, and message drafts together so the next step stays obvious.",
          tone: "accent" as const,
          heroPoints: patientJourney.careTasks.slice(0, 3).map((task) => task.title),
          quickLinks: [
            { href: "/tasks", label: "Open tasks" },
            { href: "/support", label: "Ask support" },
            { href: "/reminders", label: "Review reminders" },
          ],
          laneTitle: "Patient panel",
          laneDescription: patientJourney.aiInsights[0]?.summary ?? "Review your next medication steps in plain language.",
          laneItems: [
            patientJourney.messageDraft.subject,
            `${patientJourney.medication.name} refill due in ${patientJourney.medication.refillDueInDays} days`,
            `Next visit: ${patientJourney.profile.nextAppointmentAt}`,
          ],
        };

  const moduleLinks = [
    {
      href: "/tasks",
      title: "Tasks",
      detail: "Checklist actions for onboarding, review, and missing information.",
    },
    {
      href: "/adherence",
      title: "Adherence",
      detail: "Track dose status and note changes without leaving the shell.",
    },
    {
      href: "/reminders",
      title: "Reminders",
      detail: "Keep refill timing and notifications visible in one place.",
    },
    {
      href: "/messages",
      title: "Messages",
      detail: "Review or draft patient and provider follow-up quickly.",
    },
    {
      href: "/support",
      title: "Support",
      detail: "Ask the assistant to explain the next step in plain language.",
    },
    {
      href: "/account",
      title: "Account",
      detail: "Open user details and session controls from the same workspace.",
    },
  ];

  return (
    <PostLoginShell currentPath="/dashboard">
      <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow={dashboardContent.eyebrow}
          title={dashboardContent.title}
          description={dashboardContent.description}
        >
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusPill tone={dashboardContent.tone}>{context.role} mode</StatusPill>
            <StatusPill>Unified dashboard shell</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {dashboardContent.quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className={themeClassNames.secondaryButtonCompact}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {dashboardContent.heroPoints.map((point) => (
              <div key={point} className={themeClassNames.softPanel}>
                <p className={themeClassNames.text.body}>{point}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Role-wise lane"
          title={dashboardContent.laneTitle}
          description={dashboardContent.laneDescription}
        >
          <div className="space-y-3">
            {dashboardContent.laneItems.map((item) => (
              <div key={item} className={themeClassNames.subtlePanel}>
                <p className={themeClassNames.text.body}>{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {countCards.map((card) => (
          <div key={card.key} className={themeClassNames.metricTile}>
            <p className={themeClassNames.text.label}>{card.label}</p>
            <p className={cx("mt-3", themeClassNames.text.headingMetric)}>
              {counts[card.key]}
            </p>
            <p className={cx("mt-2", themeClassNames.text.body)}>{card.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <SectionCard
          eyebrow="Workspace modules"
          title="Every main component is now reachable from the same dashboard shell"
          description="Use the sidebar or these content cards to move through the app quickly."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {moduleLinks.map((module) => (
              <Link key={module.href} href={module.href} className={themeClassNames.softPanel}>
                <p className={themeClassNames.text.bodyStrong}>{module.title}</p>
                <p className={cx("mt-2", themeClassNames.text.body)}>{module.detail}</p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="This week"
          title="Care timeline snapshot"
          description="Keep the dashboard focused on the immediate story, not every possible workflow."
        >
          <div className="space-y-3">
            {patientJourney.timeline.map((item) => (
              <div key={item.label} className={themeClassNames.subtlePanel}>
                <p className={themeClassNames.text.bodyStrong}>{item.label}</p>
                <p className={cx("mt-2", themeClassNames.text.body)}>{item.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      {profile ? (
        <section className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
          <SectionCard
            eyebrow="Live profile"
            title={profile.condition_name}
            description={`Therapy status: ${profile.therapy_status}`}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={themeClassNames.subtlePanel}>
                <p className={themeClassNames.text.label}>Linked profile</p>
                <p className={cx("mt-2", themeClassNames.text.bodyStrong)}>
                  {counts.patientProfileId}
                </p>
              </div>
              <div className={themeClassNames.subtlePanel}>
                <p className={themeClassNames.text.label}>Next appointment</p>
                <p className={cx("mt-2", themeClassNames.text.bodyStrong)}>
                  {profile.next_appointment_at
                    ? new Date(profile.next_appointment_at).toLocaleString()
                    : "Not scheduled yet"}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Medication notes"
            title={patientJourney.medication.name}
            description={patientJourney.medication.instructions}
          >
            <div className="space-y-3">
              {patientJourney.education.map((item) => (
                <div key={item} className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.body}>{item}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      ) : (
        <RoleAwareEmptyState
          roleMode={context.role}
          title="No patient profile linked yet"
          description={
            context.role === "provider"
              ? "Provider mode is active, but no scoped patient profile is attached to this session yet."
              : "Patient mode is active, but your live profile setup is still incomplete."
          }
          ctaHref="/account"
          ctaLabel="Open account settings"
        />
      )}
    </PostLoginShell>
  );
}
