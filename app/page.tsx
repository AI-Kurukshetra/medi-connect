import type { Metadata } from "next";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { patientJourney } from "@/lib/mock-data";
import { appTheme, cx, themeClassNames, themeLayoutClasses } from "@/theme";

export const metadata: Metadata = {
  title: "MediConnect | Patient Portal For Specialty Medication Journeys",
  description:
    "MediConnect is a patient-first specialty medication portal with AI-guided checklists, reminders, messages, and provider follow-up in one connected workspace.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MediConnect | Patient Portal For Specialty Medication Journeys",
    description:
      "Patients get clear next steps. Providers get a tighter review lane. Both live in one connected portal.",
    url: "/",
    siteName: appTheme.brand.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediConnect | Patient Portal For Specialty Medication Journeys",
    description:
      "A cleaner specialty medication portal for tasks, reminders, messages, support, and provider review.",
  },
};

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const {
    patient,
    profile,
    medication,
    aiInsights,
    careTasks,
    reminders,
    messageDraft,
    providerSummary,
    timeline,
  } = patientJourney;

  const heroMetrics = [
    {
      label: "Patients",
      value: "Clear next steps",
      detail: "Checklist, reminders, and support stay in plain language.",
    },
    {
      label: "Providers",
      value: "Faster follow-up",
      detail: "Review blockers, adherence signals, and drafted outreach in one place.",
    },
    {
      label: "AI role",
      value: "Explain and draft",
      detail: "AI summarizes, rewrites, and guides. Humans still make care decisions.",
    },
  ];

  const featureGrid = [
    {
      title: "Task board that answers what happens next",
      detail: "Patients get a calmer checklist instead of scattered medication setup steps.",
    },
    {
      title: "Reminders and adherence in the same rhythm",
      detail: "Dose prep, follow-up, and refill timing stay visible without leaving the portal.",
    },
    {
      title: "Secure messaging that starts from context",
      detail: "Questions, drafts, and provider outreach connect back to the medication journey.",
    },
    {
      title: "Provider review that stays lightweight",
      detail: "The MVP highlights blockers and AI summaries without turning into enterprise software.",
    },
  ];

  const roleBoards = [
    {
      eyebrow: "Patient mode",
      title: "A simpler therapy start for patients",
      description:
        "The portal keeps medication prep, reminders, and support inside one calm experience.",
      tone: "accent" as const,
      points: [
        aiInsights[0]?.summary ?? "Review your next medication steps in plain language.",
        `${medication.name} refill due in ${medication.refillDueInDays} days.`,
        `Next follow-up: ${profile.nextAppointmentAt}.`,
      ],
      ctaHref: "/sign-up",
      ctaLabel: "Create patient access",
      panelClassName:
        "border-[rgba(68,111,255,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.98))]",
    },
    {
      eyebrow: "Provider mode",
      title: "A tighter review surface for care teams",
      description:
        "Providers can scan blockers, adherence context, and outreach prompts without jumping between systems.",
      tone: "warning" as const,
      points: [
        providerSummary.adherenceTrend,
        providerSummary.recommendedAction,
        `Assigned patient: ${patient.name}.`,
      ],
      ctaHref: "/sign-in",
      ctaLabel: "Open provider sign in",
      panelClassName:
        "border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,255,0.98))]",
    },
  ];

  const workflowSteps = [
    {
      label: "01",
      title: "Patients land on one clear story",
      detail: "The homepage explains the medication journey before anyone hits a form.",
    },
    {
      label: "02",
      title: "Sign in routes into one shared shell",
      detail: "Patients and providers use the same portal frame with role-aware content.",
    },
    {
      label: "03",
      title: "Core modules stay visible together",
      detail: "Tasks, reminders, adherence, support, and messages stay connected.",
    },
    {
      label: "04",
      title: "AI keeps the flow understandable",
      detail: "Summaries, question drafts, and next-step guidance reduce confusion fast.",
    },
  ];

  const launchChecklist = [
    "Open the landing page and explain the product in under 20 seconds.",
    "Show the mini portal preview before entering the authenticated workspace.",
    "Walk through tasks, reminders, support, and messages without changing layout patterns.",
    "Switch to the provider story to show blockers and AI-assisted follow-up.",
  ];

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: appTheme.brand.name,
    url: siteUrl,
    description:
      "MediConnect is a patient-first specialty medication portal with AI-guided checklists, reminders, and provider follow-up.",
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: appTheme.brand.name,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "MediConnect helps patients and providers move through specialty medication onboarding, reminders, messages, and follow-up inside one structured portal.",
    url: siteUrl,
  };

  return (
    <div className={themeLayoutClasses.pageFrame}>
      <div className={themeLayoutClasses.container}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />

        <AppNav currentPath="/" />

        <main className={themeLayoutClasses.main}>
          <section className="grid gap-6 xl:grid-cols-[1.03fr_0.97fr]">
            <section className="relative overflow-hidden rounded-[38px] border border-[rgba(68,111,255,0.16)] bg-[linear-gradient(135deg,#101a33_0%,#152347_34%,#2d63e6_100%)] p-7 text-white shadow-[0_32px_80px_-42px_rgba(37,99,235,0.6)] md:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_36%)]" />
              <div className="absolute inset-y-0 right-0 w-[42%] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
              <div className="absolute right-[-4rem] top-[-3rem] h-56 w-56 rounded-full border border-white/8 bg-white/6" />
              <div className="absolute bottom-[-5rem] right-10 h-60 w-60 rounded-full border border-white/8 bg-white/5" />

              <div className="relative">
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone="accent">Patient-first portal</StatusPill>
                  <StatusPill>AI-guided clarity</StatusPill>
                  <StatusPill>Shared provider workspace</StatusPill>
                </div>

                <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-[-0.07em] text-white md:text-6xl">
                  Specialty medication care, finally shaped like one connected portal.
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100 md:text-xl">
                  MediConnect gives patients a calmer start and gives providers a cleaner review lane.
                  Tasks, reminders, messages, support, and follow-up all live inside the same product
                  rhythm.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/sign-up"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#2256da] shadow-[0_22px_40px_-26px_rgba(255,255,255,0.8)] transition hover:bg-blue-50"
                  >
                    Create account
                  </Link>
                  <Link
                    href="/sign-in"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 text-sm font-semibold text-white transition hover:bg-white/12"
                  >
                    Sign in to portal
                  </Link>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {heroMetrics.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[24px] border border-white/12 bg-white/8 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100/80">
                        {item.label}
                      </p>
                      <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-white">
                        {item.value}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-blue-100">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section
              id="workspace"
              className="rounded-[34px] border border-slate-800 bg-[linear-gradient(180deg,#0d1527_0%,#111b31_100%)] p-4 shadow-[0_28px_68px_-38px_rgba(15,23,42,0.8)]"
            >
              <div className="rounded-[28px] border border-slate-800 bg-[#0f172a] p-4">
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Portal preview
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                      The landing page now looks like the product it leads into.
                    </h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                    Live demo
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[112px_1fr]">
                  <div className="rounded-[24px] border border-slate-800 bg-[#0b1221] p-3">
                    <div className="rounded-2xl bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] px-3 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-20px_rgba(59,130,246,0.7)]">
                      Dashboard
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-slate-500">
                      <div className="rounded-xl px-3 py-2 text-slate-300">Tasks</div>
                      <div className="rounded-xl px-3 py-2 text-slate-300">Reminders</div>
                      <div className="rounded-xl px-3 py-2 text-slate-300">Messages</div>
                      <div className="rounded-xl px-3 py-2 text-slate-300">Support</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[26px] bg-[linear-gradient(135deg,#3c6be4_0%,#2d63e6_62%,#5f8dff_100%)] p-5 text-white">
                      <p className="text-3xl font-semibold tracking-[-0.05em]">Hello, {patient.name.split(" ")[0]}</p>
                      <p className="mt-2 text-sm text-blue-100">{profile.therapyStatus}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                          Active plan
                        </span>
                        <span className="text-sm text-blue-100">{profile.condition}</span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[20px] border border-slate-800 bg-[#121d35] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Open tasks
                        </p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                          {careTasks.filter((task) => task.status !== "complete").length}
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-slate-800 bg-[#121d35] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Reminders
                        </p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                          {reminders.length}
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-slate-800 bg-[#121d35] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Follow-up
                        </p>
                        <p className="mt-3 text-sm font-semibold leading-6 text-slate-100">
                          {providerSummary.blockers[0]}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-800 bg-[#121d35] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">Next actions</p>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          This week
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {careTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-800 bg-[#0b1221] px-3 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-100">{task.title}</p>
                              <p className="mt-1 text-xs text-slate-400">{task.dueLabel}</p>
                            </div>
                            <div
                              className={cx(
                                "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                                task.status === "complete"
                                  ? "bg-emerald-500/10 text-emerald-300"
                                  : task.status === "current"
                                    ? "bg-amber-500/10 text-amber-300"
                                    : "bg-blue-500/10 text-blue-300",
                              )}
                            >
                              {task.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>

          <section
            id="story"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr]"
          >
            <section className="rounded-[30px] border border-[rgba(68,111,255,0.12)] bg-white p-6 shadow-[0_18px_38px_-28px_rgba(35,56,128,0.18)] md:col-span-2 xl:col-span-1">
              <p className={themeClassNames.text.eyebrow}>Why it converts better</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                The homepage now feels like the portal, not a separate marketing skin.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Instead of broad healthcare copy, the landing page now sells one specific story:
                specialty medication patients need clarity, and care teams need a simple review lane.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <StatusPill tone="accent">Tasks</StatusPill>
                <StatusPill tone="warning">Reminders</StatusPill>
                <StatusPill>Messages</StatusPill>
                <StatusPill>Support</StatusPill>
              </div>
            </section>

            {featureGrid.map((feature) => (
              <section
                key={feature.title}
                className="rounded-[30px] border border-[rgba(68,111,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(246,249,255,0.98))] p-6 shadow-[0_18px_38px_-28px_rgba(35,56,128,0.14)]"
              >
                <div className="h-10 w-10 rounded-2xl bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] shadow-[0_18px_30px_-22px_rgba(59,130,246,0.7)]" />
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.detail}</p>
              </section>
            ))}
          </section>

          <section id="roles" className="grid gap-6 xl:grid-cols-2">
            {roleBoards.map((board) => (
              <section
                key={board.title}
                className={cx(
                  "rounded-[34px] border p-7 shadow-[0_20px_42px_-30px_rgba(35,56,128,0.18)]",
                  board.panelClassName,
                )}
              >
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone={board.tone}>{board.eyebrow}</StatusPill>
                  <StatusPill>Shared shell</StatusPill>
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                  {board.title}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
                  {board.description}
                </p>

                <div className="mt-6 space-y-3">
                  {board.points.map((point) => (
                    <div
                      key={point}
                      className="rounded-[22px] border border-[rgba(68,111,255,0.1)] bg-white/88 px-4 py-4"
                    >
                      <p className="text-sm leading-7 text-slate-700">{point}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href={board.ctaHref}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] px-5 text-sm font-semibold text-white shadow-[0_20px_34px_-22px_rgba(59,130,246,0.75)] transition hover:brightness-[1.03]"
                >
                  {board.ctaLabel}
                </Link>
              </section>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
            <SectionCard
              eyebrow="Portal rhythm"
              title="How the product moves from orientation to action"
              description="The landing page now sets up the same flow users see after they enter the portal."
            >
              <div className="space-y-3">
                {workflowSteps.map((step) => (
                  <div
                    key={step.label}
                    className="grid gap-3 rounded-[24px] border border-[rgba(68,111,255,0.12)] bg-[rgba(248,251,255,0.96)] p-4 sm:grid-cols-[56px_1fr]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] text-sm font-semibold text-white shadow-[0_18px_30px_-22px_rgba(59,130,246,0.7)]">
                      {step.label}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-950">{step.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <section className="grid gap-6">
              <SectionCard
                eyebrow="Patient-facing moments"
                title="The key portal moments already fit on one screen"
                description="Instead of long feature marketing, the page previews the exact actions patients and providers will take."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {timeline.map((item) => (
                    <div key={item.label} className={themeClassNames.softPanel}>
                      <p className={themeClassNames.text.bodyStrong}>{item.label}</p>
                      <p className={cx("mt-2", themeClassNames.text.body)}>{item.detail}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Portal signals"
                title="What stays visible after sign-in"
                description="The landing page primes the exact modules people rely on once they enter the product."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <div className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.bodyStrong}>Medication guidance</p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>
                      {aiInsights[1]?.summary}
                    </p>
                  </div>
                  <div className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.bodyStrong}>Secure outreach</p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>{messageDraft.subject}</p>
                  </div>
                  {reminders.slice(0, 2).map((reminder) => (
                    <div key={reminder.id} className={themeClassNames.subtlePanel}>
                      <p className={themeClassNames.text.bodyStrong}>{reminder.title}</p>
                      <p className={cx("mt-2", themeClassNames.text.body)}>
                        {reminder.window} · {reminder.channel}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>
          </section>

          <section
            id="launch"
            className="rounded-[38px] border border-[rgba(68,111,255,0.14)] bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_45%,#f8fbff_100%)] p-7 shadow-[0_24px_54px_-34px_rgba(35,56,128,0.18)] md:p-9"
          >
            <div className="grid gap-8 xl:grid-cols-[0.98fr_1.02fr] xl:items-end">
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone="accent">Demo ready</StatusPill>
                  <StatusPill>Tailored to the portal theme</StatusPill>
                </div>
                <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-slate-950">
                  Start on a stronger landing page, then move straight into the workspace.
                </h2>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                  The product story is now tighter: explain the portal, show the preview, sign in,
                  then move through the same blue-and-navy design language inside the app itself.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/sign-up"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] px-6 text-sm font-semibold text-white shadow-[0_20px_34px_-22px_rgba(59,130,246,0.75)] transition hover:brightness-[1.03]"
                  >
                    Create account
                  </Link>
                  <Link
                    href="/sign-in"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[rgba(68,111,255,0.16)] bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Sign in
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {launchChecklist.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-[24px] border border-[rgba(68,111,255,0.12)] bg-white px-4 py-4 shadow-[0_16px_32px_-28px_rgba(35,56,128,0.16)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#4f86ff]">
                      Step 0{index + 1}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-8 border-t border-slate-200 py-6">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
            <p className="text-xs text-slate-400">© 2026 {appTheme.brand.name}. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <Link href="/support" className="hover:text-slate-900 transition">Help Center</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
