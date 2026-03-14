import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { patientJourney } from "@/lib/mock-data";
import { cx, themeClassNames } from "@/theme";

export const metadata: Metadata = {
  title: "Patients",
  description:
    "See how MediConnect helps patients manage specialty medication onboarding, reminders, support, and follow-up with less confusion.",
  alternates: {
    canonical: "/patients",
  },
};

export default function PatientsPage() {
  const { profile, medication, aiInsights, careTasks, reminders, education } = patientJourney;

  return (
    <MarketingShell currentPath="/patients">
      <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <section className="rounded-[38px] border border-[rgba(68,111,255,0.16)] bg-[linear-gradient(135deg,#0f1a32_0%,#163057_45%,#2f6cf0_100%)] p-7 text-white shadow-[0_32px_80px_-42px_rgba(37,99,235,0.58)] md:p-10">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="accent">Patient journey</StatusPill>
            <StatusPill>Plain-language support</StatusPill>
            <StatusPill>AI guidance</StatusPill>
          </div>
          <h1 className="mt-7 text-4xl font-semibold tracking-[-0.07em] text-white md:text-6xl">
            A simpler therapy start for patients.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100 md:text-xl">
            Patients should not have to decode specialty medication setup on their own. MediConnect
            turns the journey into clear tasks, reminder timing, secure support, and one next step at a time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#2256da] transition hover:bg-blue-50"
            >
              Create patient access
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              Open patient portal
            </Link>
          </div>
        </section>

        <section className="rounded-[34px] border border-[rgba(68,111,255,0.12)] bg-white p-6 shadow-[0_18px_38px_-28px_rgba(35,56,128,0.18)]">
          <p className={themeClassNames.text.eyebrow}>What patients see</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            One dashboard that answers what happens next.
          </h2>
          <div className="mt-6 grid gap-3">
            {[
              { label: "Condition", value: profile.condition },
              { label: "Therapy status", value: profile.therapyStatus },
              { label: "Medication", value: `${medication.name} · ${medication.dosage}` },
              { label: "Refill timing", value: `Due in ${medication.refillDueInDays} days` },
            ].map((item) => (
              <div key={item.label} className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          eyebrow="Before first dose"
          title="Patients get a checklist instead of fragmented setup work."
          description="The product translates the start plan into visible tasks and plain-language preparation."
        >
          <div className="space-y-3">
            {careTasks.map((task) => (
              <div key={task.id} className="rounded-[22px] border border-[rgba(68,111,255,0.12)] bg-[rgba(248,251,255,0.96)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-950">{task.title}</p>
                  <span
                    className={cx(
                      "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      task.status === "complete"
                        ? "bg-emerald-50 text-emerald-600"
                        : task.status === "current"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-blue-50 text-blue-600",
                    )}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{task.description}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {task.dueLabel}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="During therapy"
          title="Reminders and reassurance stay in the same flow."
          description="Patients do not need to leave the product to understand timing, follow-up, or common preparation guidance."
        >
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div key={reminder.id} className={themeClassNames.softPanel}>
                <p className={themeClassNames.text.bodyStrong}>{reminder.title}</p>
                <p className={cx("mt-2", themeClassNames.text.body)}>
                  {reminder.window} · {reminder.channel}
                </p>
              </div>
            ))}
            <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm font-semibold text-emerald-800">Education stays close to the task flow</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
                {education.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <SectionCard
          eyebrow="AI support"
          title="AI reduces confusion without making care decisions."
          description="The assistant explains medication steps, drafts questions, and highlights what matters next."
        >
          <div className="space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight.id} className={themeClassNames.subtlePanel}>
                <p className={themeClassNames.text.bodyStrong}>{insight.title}</p>
                <p className={cx("mt-2", themeClassNames.text.body)}>{insight.summary}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <section className="rounded-[38px] border border-[rgba(68,111,255,0.14)] bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_45%,#f8fbff_100%)] p-7 shadow-[0_24px_54px_-34px_rgba(35,56,128,0.18)] md:p-9">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="accent">Why this page matters</StatusPill>
            <StatusPill>Patient detail page</StatusPill>
          </div>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-slate-950">
            Dedicated pages make the product easier to trust.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            The patient page gives the product room to explain onboarding, reminder rhythm, and AI help without forcing all of it into the homepage.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/providers"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] px-6 text-sm font-semibold text-white shadow-[0_20px_34px_-22px_rgba(59,130,246,0.75)] transition hover:brightness-[1.03]"
            >
              View provider page
            </Link>
            <Link
              href="/platform"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[rgba(68,111,255,0.16)] bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              View platform details
            </Link>
          </div>
        </section>
      </section>
    </MarketingShell>
  );
}
