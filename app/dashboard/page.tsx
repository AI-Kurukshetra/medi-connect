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

function ProviderQueueCard({
  patientName,
  condition,
  stage,
  blocker,
  actionLabel,
  actionHref,
  accentClassName,
  stageClassName,
}: {
  patientName: string;
  condition: string;
  stage: string;
  blocker: string;
  actionLabel: string;
  actionHref: string;
  accentClassName: string;
  stageClassName: string;
}) {
  const initials = patientName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <article className="overflow-hidden rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,255,0.98))] p-5 shadow-[0_22px_42px_-32px_rgba(15,23,42,0.26)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_48px_-30px_rgba(37,99,235,0.22)]">
      <div className={cx("mb-5 h-1.5 w-24 rounded-full", accentClassName)} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e7efff,#cddcff)] text-sm font-semibold text-[#356ae6] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em] text-slate-900">{patientName}</p>
            <p className="mt-1 text-sm text-slate-500">{condition}</p>
          </div>
        </div>
        <span
          className={cx(
            "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
            stageClassName,
          )}
        >
          {stage}
        </span>
      </div>

      <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50/90 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Next blocker
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{blocker}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Care review lane
        </p>
        <Link
          href={actionHref}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] px-4 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(59,130,246,0.8)] transition hover:-translate-y-0.5 hover:brightness-[1.03]"
        >
          {actionLabel}
        </Link>
      </div>
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
  const providerQueue = [
    {
      patientName: "Maya Patel",
      condition: conditionName,
      stage: "Needs follow-up",
      blocker: patientJourney.providerSummary.blockers[0] ?? "Symptom baseline still needs review.",
      actionLabel: "Open review",
      actionHref: "/ai-insights",
      accentClassName: "bg-[linear-gradient(135deg,#f59e0b,#f97316)]",
      stageClassName: "bg-amber-50 text-amber-700",
    },
    {
      patientName: "Jordan Kim",
      condition: "Psoriatic arthritis",
      stage: "Reminder approval",
      blocker: "Reminder timing is selected, but provider approval is still pending.",
      actionLabel: "Approve timing",
      actionHref: "/reminders",
      accentClassName: "bg-[linear-gradient(135deg,#6366f1,#4f46e5)]",
      stageClassName: "bg-indigo-50 text-indigo-700",
    },
    {
      patientName: "Ava Singh",
      condition: "Crohn's disease",
      stage: "Draft ready",
      blocker: "AI drafted refill outreach and is waiting for human approval.",
      actionLabel: "Review draft",
      actionHref: "/messages",
      accentClassName: "bg-[linear-gradient(135deg,#10b981,#0f9f74)]",
      stageClassName: "bg-emerald-50 text-emerald-700",
    },
  ];
  const providerActivity = [
    {
      title: "2 message drafts need approval",
      detail: "Review AI-written follow-up before patient delivery.",
      href: "/messages",
      ctaLabel: "Open drafts",
      toneClassName: "border-blue-100 bg-blue-50/70",
    },
    {
      title: "1 reminder window is waiting on sign-off",
      detail: "Keep timing aligned before the first at-home dose.",
      href: "/reminders",
      ctaLabel: "Open reminders",
      toneClassName: "border-indigo-100 bg-indigo-50/70",
    },
    {
      title: "Thursday symptom review is already scheduled",
      detail: `Next review window: ${appointmentLabel}.`,
      href: "/adherence",
      ctaLabel: "Review timeline",
      toneClassName: "border-emerald-100 bg-emerald-50/70",
    },
  ];

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
      heading: `Welcome back, ${firstName}`,
      body: "Your provider workspace is focused on care coordination, follow-up approvals, and patient blockers that need attention today.",
      planLabel: "Care workspace",
      detailLabel: "3 patients need review",
      primaryLabel: "Open provider review",
      primaryHref: "/ai-insights",
      secondaryLabel: "Check messages",
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
              style={{
                color: '#2558d7'
              }}
              className="inline-flex items-center justify-center rounded-xl border border-[#2558d7] bg-white px-5 py-3 text-sm font-semibold text-[#2558d7] shadow-[0_12px_24px_-16px_rgba(37,88,215,0.85)] transition hover:bg-blue-50"
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

      {isProvider ? (
        <>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
            <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.22)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">
                  Care Queue
                </h2>
                <Link
                  href="/ai-insights"
                  className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#356ae6] transition hover:bg-blue-100"
                >
                  Open review lane
                </Link>
              </div>

              <div className="mt-4 grid gap-4">
                {providerQueue.map((entry) => (
                  <ProviderQueueCard key={entry.patientName} {...entry} />
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.22)]">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">
                  Today&apos;s Priorities
                </h2>
                <div className="mt-4 space-y-3">
                  {providerActivity.map((item) => (
                    <div
                      key={item.title}
                      className={cx(
                        "rounded-[18px] border p-4 shadow-[0_12px_26px_-24px_rgba(15,23,42,0.22)]",
                        item.toneClassName,
                      )}
                    >
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                      <div className="mt-4">
                        <Link
                          href={item.href}
                          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          {item.ctaLabel}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.22)]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">
                    AI Visit Brief
                  </h2>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Human review required
                  </span>
                </div>

                <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Summary
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {patientJourney.providerSummary.note}
                  </p>
                </div>

                <div className="mt-4 grid gap-3">
                  {patientJourney.providerSummary.blockers.map((blocker) => (
                    <div key={blocker} className="flex items-start gap-3 rounded-[16px] border border-amber-100 bg-amber-50 px-4 py-3">
                      <span className="mt-1 block h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <p className="text-sm leading-6 text-amber-900">{blocker}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/messages"
                    className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(59,130,246,0.75)] transition hover:-translate-y-0.5 hover:brightness-[1.03]"
                  >
                    Approve outreach
                  </Link>
                  <Link
                    href="/tasks"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Open tasks
                  </Link>
                </div>
              </section>
            </section>
          </section>
        </>
      ) : (
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">
                Upcoming Tasks
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
              Treatment Progress
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
      )}
    </PostLoginShell>
  );
}
