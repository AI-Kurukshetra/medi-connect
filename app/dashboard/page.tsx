import type { Metadata } from "next";
import Link from "next/link";
import { PostLoginShell } from "@/components/post-login-shell";
import { requireAuthContext } from "@/lib/auth/server";
import { getDashboardCounts, getScopedPatientProfile } from "@/lib/data/post-login";
import { patientJourney } from "@/lib/mock-data";
import { cx } from "@/theme";

export const metadata: Metadata = {
  title: "Dashboard",
  alternates: { canonical: "/dashboard" },
};

function formatAppointmentLabel(rawValue?: string | null) {
  if (!rawValue) return patientJourney.profile.nextAppointmentAt;

  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) return rawValue;

  return parsed.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DashboardMetricCard({
  label,
  value,
  detail,
  accentClassName,
  dotClassName,
}: {
  label: string;
  value: string;
  detail: string;
  accentClassName: string;
  dotClassName: string;
}) {
  return (
    <article className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div className={cx("rounded-xl p-2.5", accentClassName)}>
          <span className={cx("block h-2.5 w-2.5 rounded-full", dotClassName)} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {detail}
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-[2rem] font-semibold tracking-[-0.05em] text-slate-900">{value}</p>
    </article>
  );
}

export default async function DashboardPage() {
  const context = await requireAuthContext();
  const [profile, counts] = await Promise.all([
    getScopedPatientProfile(context),
    getDashboardCounts(context),
  ]);

  const isProvider = context.role === "provider";
  const firstName = context.fullName.split(" ")[0] ?? context.fullName;
  const openTasks = patientJourney.careTasks.filter((task) => task.status !== "complete");
  const appointmentLabel = formatAppointmentLabel(profile?.next_appointment_at);
  const conditionName = profile?.condition_name ?? patientJourney.profile.condition;
  const progressPercent = isProvider ? 88 : 92;
  const completedSessions = isProvider ? "11/14" : "14/16";
  const milestoneCopy = isProvider
    ? "Next milestone: symptom review follow-up in 2 days"
    : "Next milestone: full mobility assessment in 4 days";

  const metricCards = isProvider
    ? [
      {
        label: "Active blockers",
        value: String(patientJourney.providerSummary.blockers.length),
        detail: "Needs follow-up",
        accentClassName: "bg-amber-50",
        dotClassName: "bg-amber-500",
      },
      {
        label: "Patient tasks",
        value: String(counts.taskCount || patientJourney.careTasks.length),
        detail: "Open board",
        accentClassName: "bg-blue-50",
        dotClassName: "bg-blue-500",
      },
      {
        label: "Reminders",
        value: String(counts.reminderCount || patientJourney.reminders.length),
        detail: "Upcoming",
        accentClassName: "bg-indigo-50",
        dotClassName: "bg-indigo-500",
      },
      {
        label: "Messages",
        value: String(counts.messageCount || 1),
        detail: "Needs reply",
        accentClassName: "bg-rose-50",
        dotClassName: "bg-rose-500",
      },
    ]
    : [
      {
        label: "Tasks",
        value: String(openTasks.length),
        detail: "Open",
        accentClassName: "bg-amber-50",
        dotClassName: "bg-amber-500",
      },
      {
        label: "Adherence",
        value: `${progressPercent}%`,
        detail: "+2% vs LW",
        accentClassName: "bg-emerald-50",
        dotClassName: "bg-emerald-500",
      },
      {
        label: "Reminders",
        value: String(counts.reminderCount || patientJourney.reminders.length),
        detail: "Upcoming",
        accentClassName: "bg-blue-50",
        dotClassName: "bg-blue-500",
      },
      {
        label: "Messages",
        value: String(counts.messageCount || 1),
        detail: "Unread",
        accentClassName: "bg-rose-50",
        dotClassName: "bg-rose-500",
      },
    ];

  const taskRows = isProvider
    ? [
      {
        title: "Review symptom baseline",
        subtitle: "Patient response needed before the next call",
        actionLabel: "Open chart",
        locked: false,
      },
      {
        title: "Approve reminder window",
        subtitle: "Patient selected Tuesday at 7:30 PM",
        actionLabel: "Approve",
        locked: false,
      },
      {
        title: "Confirm follow-up note",
        subtitle: `Visit scheduled for ${appointmentLabel}`,
        actionLabel: "Locked",
        locked: true,
      },
    ]
    : [
      {
        title: "Shoulder mobility drill",
        subtitle: "Scheduled for 2:00 PM",
        actionLabel: "Start now",
        locked: false,
      },
      {
        title: "Daily hydration log",
        subtitle: "Remaining 1.2L",
        actionLabel: "Log intake",
        locked: false,
      },
      {
        title: openTasks[0]?.title ?? "Evening symptom check-in",
        subtitle: openTasks[0]?.dueLabel ?? "Available from 6:00 PM",
        actionLabel: "Locked",
        locked: true,
      },
    ];

  const heroCopy = isProvider
    ? {
      heading: `${patientJourney.patient.name} needs one more touchpoint`,
      body: patientJourney.providerSummary.recommendedAction,
      planLabel: "Provider review",
      detailLabel: conditionName,
      primaryLabel: "Review AI summary",
      primaryHref: "/ai-insights",
      secondaryLabel: "Message patient",
      secondaryHref: "/messages",
    }
    : {
      heading: `Hello, ${firstName}`,
      body: "Week 3 of therapy. You're doing great! Keep up the consistency.",
      planLabel: "Active plan",
      detailLabel: conditionName,
      primaryLabel: "Log medication",
      primaryHref: "/adherence",
      secondaryLabel: "Message provider",
      secondaryHref: "/messages",
    };

  return (
    <PostLoginShell currentPath="/dashboard">
      <section className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#356ae6,#2a58d4)] p-6 text-white shadow-[0_30px_70px_-36px_rgba(37,99,235,0.6)] md:p-8">
        <div className="absolute right-[-4rem] top-[-3rem] h-52 w-52 rounded-full bg-white/8" />
        <div className="absolute right-10 top-4 h-36 w-36 rounded-full bg-white/6" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-[2.25rem]">
              {heroCopy.heading}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100 md:text-base">
              {heroCopy.body}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/16 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                {heroCopy.planLabel}
              </span>
              <span className="text-sm text-blue-100">{heroCopy.detailLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:max-w-xs lg:flex-col lg:items-stretch">
            <Link
              href={heroCopy.primaryHref}
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold bg-white text-[#2558d7] shadow-[0_12px_24px_-16px_rgba(37,88,215,0.85)] border border-[#2558d7] transition hover:bg-blue-500"
              style={{
                color: '#2558d7 '
              }}
            >
              {heroCopy.primaryLabel}
            </Link>
            <Link
              href={heroCopy.secondaryHref}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {heroCopy.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <DashboardMetricCard key={card.label} {...card} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.22)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">
              {isProvider ? "Priority Tasks" : "Upcoming Tasks"}
            </h2>
            <Link href="/tasks" className="text-sm font-semibold text-[#356ae6]">
              View all
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-[18px] border border-slate-200">
            {taskRows.map((task, index) => (
              <div
                key={task.title}
                className={cx(
                  "flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
                  index !== taskRows.length - 1 && "border-b border-slate-200",
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <span className="block h-2.5 w-2.5 rounded-full bg-[#356ae6]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.subtitle}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={cx(
                    "inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-semibold transition",
                    task.locked
                      ? "bg-slate-100 text-slate-400"
                      : "bg-[#356ae6] text-white hover:bg-[#2959d6]",
                  )}
                >
                  {task.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.22)]">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">
            {isProvider ? "Patient Progress" : "Treatment Progress"}
          </h2>

          <div className="mt-5 flex justify-center">
            <div
              className="flex h-44 w-44 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#356ae6 ${progressPercent}%, #dce7fb ${progressPercent}% 100%)`,
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white text-center">
                <p className="text-[2rem] font-semibold tracking-[-0.05em] text-slate-900">
                  {progressPercent}%
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Consistency
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-500">Completed sessions</span>
            <span className="font-semibold text-slate-900">{completedSessions}</span>
          </div>

          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[#356ae6]"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>

          <p className="mt-5 text-center text-xs leading-6 text-slate-400">{milestoneCopy}</p>
        </section>
      </section>
    </PostLoginShell>
  );
}
