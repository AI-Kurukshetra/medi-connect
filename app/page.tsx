import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { patientJourney } from "@/lib/mock-data";
import { appTheme, themeClassNames } from "@/theme";

export const metadata: Metadata = {
  title: "MediConnect | AI-Guided Specialty Care Portal",
  description:
    "MediConnect helps patients and providers move through specialty medication onboarding, reminders, support, and follow-up inside one connected portal.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { patient, profile, careTasks, reminders, providerSummary } = patientJourney;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: appTheme.brand.name,
    url: siteUrl,
    description:
      "MediConnect is a patient-first specialty medication portal with AI-guided tasks, reminders, messages, and provider review.",
  };

  const routeCards = [
    {
      href: "/patients",
      eyebrow: "Patient story",
      title: "A calmer therapy journey",
      description: "See how patients move from onboarding to reminders, support, and follow-up without confusion.",
      stats: [
        `${careTasks.filter((task) => task.status !== "complete").length} open tasks`,
        `${reminders.length} active reminders`,
      ],
    },
    {
      href: "/providers",
      eyebrow: "Provider story",
      title: "A cleaner review workspace",
      description: "See how care teams triage blockers, approve outreach, and review AI summaries in one lane.",
      stats: [
        `${providerSummary.blockers.length} blockers`,
        "AI brief ready",
      ],
    },
    {
      href: "/platform",
      eyebrow: "Platform story",
      title: "How the product fits together",
      description: "Explore the shared shell, safety boundaries, and the core modules that make the MVP demo work.",
      stats: ["Shared auth shell", "Role-aware routes"],
    },
  ];

  return (
    <MarketingShell currentPath="/">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <section className="relative overflow-hidden rounded-[38px] border border-[rgba(68,111,255,0.16)] bg-[linear-gradient(135deg,#101a33_0%,#152347_34%,#2d63e6_100%)] p-7 text-white shadow-[0_32px_80px_-42px_rgba(37,99,235,0.6)] md:p-10">
          <div className="absolute right-[-4rem] top-[-3rem] h-56 w-56 rounded-full border border-white/8 bg-white/6" />
          <div className="absolute bottom-[-5rem] right-10 h-60 w-60 rounded-full border border-white/8 bg-white/5" />

          <div className="relative">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="accent">Patient-first portal</StatusPill>
              <StatusPill>AI-guided clarity</StatusPill>
              <StatusPill>Provider review lane</StatusPill>
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-[-0.07em] text-white md:text-6xl">
              A stronger landing experience, with dedicated pages for every part of the story.
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100 md:text-xl">
              MediConnect now introduces the product like a focused healthcare portal, then routes
              visitors into dedicated patient, provider, and platform pages for the full story.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/patients"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#2256da] shadow-[0_22px_40px_-26px_rgba(255,255,255,0.8)] transition hover:bg-blue-50"
              >
                Explore patient flow
              </Link>
              <Link
                href="/providers"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Explore provider flow
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-slate-800 bg-[linear-gradient(180deg,#0d1527_0%,#111b31_100%)] p-4 shadow-[0_28px_68px_-38px_rgba(15,23,42,0.8)]">
          <div className="rounded-[28px] border border-slate-800 bg-[#0f172a] p-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Portal preview
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                  One visual language from marketing to product.
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                Live demo
              </div>
            </div>

            <div className="mt-4 space-y-4">
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
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Open tasks</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                    {careTasks.filter((task) => task.status !== "complete").length}
                  </p>
                </div>
                <div className="rounded-[20px] border border-slate-800 bg-[#121d35] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Reminders</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{reminders.length}</p>
                </div>
                <div className="rounded-[20px] border border-slate-800 bg-[#121d35] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Follow-up</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-100">
                    {providerSummary.blockers[0]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {routeCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-[32px] border border-[rgba(68,111,255,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(246,249,255,0.98))] p-6 shadow-[0_18px_38px_-28px_rgba(35,56,128,0.14)] transition hover:-translate-y-1 hover:shadow-[0_24px_44px_-28px_rgba(35,56,128,0.2)]"
          >
            <p className={themeClassNames.text.eyebrow}>{card.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {card.stats.map((stat) => (
                <span
                  key={stat}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  {stat}
                </span>
              ))}
            </div>

            <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#356ae6] transition group-hover:gap-3">
              Open page
              <span aria-hidden="true">→</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          eyebrow="Why this is better"
          title="The homepage can stay focused while the detail pages do the explaining."
          description="Instead of cramming every product story into one scroll, the landing page now acts like a clean front door."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Patients get a dedicated page with onboarding, reminders, and support details.",
              "Providers get a dedicated page with queue, blockers, and outreach details.",
              "The platform page explains the shared shell, safety boundaries, and MVP scope.",
              "The homepage stays visually stronger because it no longer has to carry every explanation.",
            ].map((item) => (
              <div key={item} className={themeClassNames.softPanel}>
                <p className={themeClassNames.text.body}>{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <section className="rounded-[38px] border border-[rgba(68,111,255,0.14)] bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_45%,#f8fbff_100%)] p-7 shadow-[0_24px_54px_-34px_rgba(35,56,128,0.18)] md:p-9">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="accent">Next steps</StatusPill>
            <StatusPill>Multi-page marketing flow</StatusPill>
          </div>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-slate-950">
            Start with the overview, then dive into the page that matches the visitor.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            This gives the product more room to explain itself without making the homepage heavy.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] px-6 text-sm font-semibold text-white shadow-[0_20px_34px_-22px_rgba(59,130,246,0.75)] transition hover:brightness-[1.03]"
            >
              Create account
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
