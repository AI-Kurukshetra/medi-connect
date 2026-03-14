import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { patientJourney } from "@/lib/mock-data";
import { cx, themeClassNames } from "@/theme";

export const metadata: Metadata = {
  title: "Providers",
  description:
    "See how MediConnect gives providers and care coordinators a lightweight review lane for blockers, adherence, and outreach.",
  alternates: {
    canonical: "/providers",
  },
};

export default function ProvidersPage() {
  const { patient, providerSummary, timeline, messageDraft } = patientJourney;

  const queueCards = [
    {
      title: `${patient.name} needs follow-up`,
      detail: providerSummary.blockers[0],
      toneClassName: "bg-amber-50 text-amber-700",
    },
    {
      title: "Reminder approval pending",
      detail: providerSummary.blockers[1],
      toneClassName: "bg-indigo-50 text-indigo-700",
    },
    {
      title: "Draft outreach ready",
      detail: "AI prepared follow-up wording and is waiting for provider review.",
      toneClassName: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <MarketingShell currentPath="/providers">
      <section className="grid gap-6 xl:grid-cols-[1.03fr_0.97fr]">
        <section className="rounded-[38px] border border-[rgba(68,111,255,0.16)] bg-[linear-gradient(135deg,#0f1a32_0%,#16284a_40%,#275fdf_100%)] p-7 text-white shadow-[0_32px_80px_-42px_rgba(37,99,235,0.58)] md:p-10">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="warning">Provider workspace</StatusPill>
            <StatusPill>AI brief</StatusPill>
            <StatusPill>Human review stays in control</StatusPill>
          </div>
          <h1 className="mt-7 text-4xl font-semibold tracking-[-0.07em] text-white md:text-6xl">
            A low-noise review lane for care teams.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100 md:text-xl">
            Providers should be able to triage patient setup, reminders, and outreach in under 30 seconds.
            MediConnect keeps blockers, AI summaries, and next actions on one screen.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#2256da] transition hover:bg-blue-50"
            >
              Open provider sign in
            </Link>
            <Link
              href="/platform"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              See platform details
            </Link>
          </div>
        </section>

        <section className="rounded-[34px] border border-[rgba(68,111,255,0.12)] bg-white p-6 shadow-[0_18px_38px_-28px_rgba(35,56,128,0.18)]">
          <p className={themeClassNames.text.eyebrow}>Care queue</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            The provider dashboard is action-first.
          </h2>
          <div className="mt-6 space-y-3">
            {queueCards.map((card) => (
              <div key={card.title} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-950">{card.title}</p>
                  <span className={cx("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", card.toneClassName)}>
                    Review
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{card.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          eyebrow="What providers need"
          title="The screen is built for triage, not passive reporting."
          description="This page shows the specific provider story the homepage can now link into."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Review blockers without reading scattered notes.",
              "See reminder timing and follow-up context in the same workflow.",
              "Use AI summaries to reduce scanning time before outreach.",
              "Approve drafted messages while keeping final control with the provider.",
            ].map((item) => (
              <div key={item} className={themeClassNames.softPanel}>
                <p className={themeClassNames.text.body}>{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="AI visit brief"
          title="AI helps summarize, draft, and highlight."
          description="The assistant can reduce reading and typing, but it never replaces provider judgment."
        >
          <div className="space-y-3">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-950">Adherence trend</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{providerSummary.adherenceTrend}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-950">Recommended action</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{providerSummary.recommendedAction}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-950">Draft outreach</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{messageDraft.subject}</p>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          eyebrow="Shared workflow"
          title="Providers and patients stay in one connected product rhythm."
          description="The provider page explains how the review lane maps back to the same tasks, reminders, messages, and adherence data patients see."
        >
          <div className="space-y-3">
            {timeline.map((item) => (
              <div key={item.label} className={themeClassNames.subtlePanel}>
                <p className={themeClassNames.text.bodyStrong}>{item.label}</p>
                <p className={cx("mt-2", themeClassNames.text.body)}>{item.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <section className="rounded-[38px] border border-[rgba(68,111,255,0.14)] bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_45%,#f8fbff_100%)] p-7 shadow-[0_24px_54px_-34px_rgba(35,56,128,0.18)] md:p-9">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="warning">Dedicated detail page</StatusPill>
            <StatusPill>Provider story</StatusPill>
          </div>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-slate-950">
            The provider page now has room to explain why the workspace matters.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            The homepage no longer has to carry every operational detail. This page can focus entirely on queue clarity, blockers, and provider follow-up.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/patients"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] px-6 text-sm font-semibold text-white shadow-[0_20px_34px_-22px_rgba(59,130,246,0.75)] transition hover:brightness-[1.03]"
            >
              View patient page
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[rgba(68,111,255,0.16)] bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Create account
            </Link>
          </div>
        </section>
      </section>
    </MarketingShell>
  );
}
