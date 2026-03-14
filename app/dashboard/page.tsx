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
  { key: "taskCount", label: "Tasks", hint: "Open checklist items" },
  { key: "adherenceCount", label: "Adherence", hint: "Check-ins and dose status" },
  { key: "reminderCount", label: "Reminders", hint: "Upcoming nudges and refill timing" },
  { key: "messageCount", label: "Messages", hint: "Drafts and follow-up notes" },
] as const;

export default async function DashboardPage() {
  const context = await requireAuthContext();
  const [profile, counts] = await Promise.all([
    getScopedPatientProfile(context),
    getDashboardCounts(context),
  ]);

  const firstName = context.fullName.split(" ")[0] ?? context.fullName;
  const demoProfile = patientJourney.profile;
  const dashboardCopy =
    context.role === "provider"
      ? {
          eyebrow: "Provider dashboard",
          title: `Welcome back, ${firstName}`,
          description:
            "Review the patient story quickly, use AI to summarize the context, and move into the right follow-up action from one workspace.",
          tone: "warning" as const,
          highlightTitle: "Provider review panel",
          highlightBody: patientJourney.providerSummary.note,
          bullets: patientJourney.providerSummary.blockers,
          quickLinks: [
            { href: "/ai-insights", label: "Open AI insights" },
            { href: "/messages", label: "Review message drafts" },
            { href: "/prior-auth", label: "Check care review" },
          ],
          detailTitle: "Recommended next action",
          detailItems: [
            patientJourney.providerSummary.recommendedAction,
            patientJourney.providerSummary.adherenceTrend,
            `Current demo patient: ${patientJourney.patient.name}`,
          ],
        }
      : {
          eyebrow: "Patient dashboard",
          title: `Welcome back, ${firstName}`,
          description:
            "Your dashboard keeps medication tasks, reminders, support, and questions in one calm place so the next step is always obvious.",
          tone: "accent" as const,
          highlightTitle: "Patient next-step panel",
          highlightBody: patientJourney.aiInsights[0]?.summary,
          bullets: patientJourney.careTasks.slice(0, 3).map((task) => task.title),
          quickLinks: [
            { href: "/tasks", label: "Open tasks" },
            { href: "/reminders", label: "View reminders" },
            { href: "/support", label: "Ask for support" },
          ],
          detailTitle: "Prepared for this week",
          detailItems: [
            patientJourney.messageDraft.subject,
            `${patientJourney.medication.name} refill due in ${patientJourney.medication.refillDueInDays} days`,
            `Next visit: ${patientJourney.profile.nextAppointmentAt}`,
          ],
        };

  const dashboardModules = [
    {
      href: "/tasks",
      title: "Tasks",
      detail: "Checklist actions for onboarding, follow-up, and blockers.",
    },
    {
      href: "/adherence",
      title: "Adherence",
      detail: "Dose status, check-ins, and follow-up notes in one stream.",
    },
    {
      href: "/reminders",
      title: "Reminders",
      detail: "Review the upcoming reminders that keep the user on track.",
    },
    {
      href: "/messages",
      title: "Messages",
      detail: "Draft or review patient and provider outreach from one page.",
    },
  ];

  return (
    <PostLoginShell currentPath="/dashboard">
      <section className="grid gap-6 lg:grid-cols-[1.16fr_0.84fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow={dashboardCopy.eyebrow}
          title={dashboardCopy.title}
          description={dashboardCopy.description}
        >
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusPill tone={dashboardCopy.tone}>{context.role} mode</StatusPill>
            <StatusPill>Structured dashboard shell</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {dashboardCopy.quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className={themeClassNames.secondaryButtonCompact}>
                {link.label}
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Role-wise panel"
          title={dashboardCopy.highlightTitle}
          description={dashboardCopy.highlightBody}
        >
          <div className="space-y-3">
            {dashboardCopy.bullets.map((item) => (
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

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <SectionCard
          eyebrow="Core modules"
          title="Open the main dashboard routes from one place"
          description="These are the first pages the demo should highlight after sign-in."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {dashboardModules.map((module) => (
              <Link key={module.href} href={module.href} className={themeClassNames.softPanel}>
                <p className={themeClassNames.text.bodyStrong}>{module.title}</p>
                <p className={cx("mt-2", themeClassNames.text.body)}>{module.detail}</p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="This week"
          title={dashboardCopy.detailTitle}
          description="Keep the most useful role-specific callouts visible on the main dashboard."
        >
          <div className="space-y-3">
            {dashboardCopy.detailItems.map((item) => (
              <div key={item} className={themeClassNames.subtlePanel}>
                <p className={themeClassNames.text.body}>{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      {profile ? (
        <section className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
          <SectionCard
            eyebrow="Live patient status"
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
            eyebrow="Demo story"
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

      <SectionCard
        eyebrow="Demo snapshot"
        title={`${demoProfile.condition} journey`}
        description="Mock data still powers the main story while the dashboard structure gets cleaner."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {patientJourney.timeline.map((item) => (
            <div key={item.label} className={themeClassNames.softPanel}>
              <p className={themeClassNames.text.bodyStrong}>{item.label}</p>
              <p className={cx("mt-2", themeClassNames.text.body)}>{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PostLoginShell>
  );
}
