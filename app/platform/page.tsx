import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { themeClassNames } from "@/theme";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "See how MediConnect uses a shared shell, role-aware routes, and AI-assisted workflows to support both patients and providers.",
  alternates: {
    canonical: "/platform",
  },
};

export default function PlatformPage() {
  const modules = [
    "Dashboard",
    "Tasks",
    "Adherence",
    "Reminders",
    "Messages",
    "Support",
    "Account",
  ];

  const platformPoints = [
    "One authenticated shell keeps navigation, search, notifications, and profile state consistent.",
    "The same routes render different content by role, which keeps the MVP easier to demo and easier to understand.",
    "AI is used to explain, summarize, draft, and highlight next steps, not to diagnose or make clinical decisions.",
    "Mock and seeded data keep the demo visible even when live records are not available.",
  ];

  return (
    <MarketingShell currentPath="/platform">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[38px] border border-[rgba(68,111,255,0.16)] bg-[linear-gradient(135deg,#101a33_0%,#152347_34%,#2d63e6_100%)] p-7 text-white shadow-[0_32px_80px_-42px_rgba(37,99,235,0.6)] md:p-10">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="accent">Shared shell</StatusPill>
            <StatusPill>Role-aware pages</StatusPill>
            <StatusPill>MVP architecture</StatusPill>
          </div>
          <h1 className="mt-7 text-4xl font-semibold tracking-[-0.07em] text-white md:text-6xl">
            How the platform fits together.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100 md:text-xl">
            This page explains the product structure behind the experience: one app shell, shared routes,
            role-aware rendering, and AI assistance that stays human-in-the-loop.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/patients"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#2256da] transition hover:bg-blue-50"
            >
              View patient page
            </Link>
            <Link
              href="/providers"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              View provider page
            </Link>
          </div>
        </section>

        <section className="rounded-[34px] border border-[rgba(68,111,255,0.12)] bg-white p-6 shadow-[0_18px_38px_-28px_rgba(35,56,128,0.18)]">
          <p className={themeClassNames.text.eyebrow}>Core modules</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            The MVP stays small, but the story feels complete.
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {modules.map((module) => (
              <div key={module} className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">{module}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          eyebrow="Product structure"
          title="One shell, multiple stories."
          description="The platform page explains the system in a way the homepage should not have to."
        >
          <div className="space-y-3">
            {platformPoints.map((point) => (
              <div key={point} className={themeClassNames.softPanel}>
                <p className={themeClassNames.text.body}>{point}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Why separate pages help"
          title="Each audience now has space for the right level of detail."
          description="This keeps the marketing experience more intentional and makes the landing page easier to scan."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Home stays concise and visual.",
              "Patients get onboarding and support details.",
              "Providers get review-lane and blocker details.",
              "The platform page explains structure and scope.",
            ].map((item) => (
              <div key={item} className={themeClassNames.subtlePanel}>
                <p className={themeClassNames.text.body}>{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="rounded-[38px] border border-[rgba(68,111,255,0.14)] bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_45%,#f8fbff_100%)] p-7 shadow-[0_24px_54px_-34px_rgba(35,56,128,0.18)] md:p-9">
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="accent">Marketing architecture</StatusPill>
          <StatusPill>Separate detail pages</StatusPill>
        </div>
        <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-slate-950">
          The marketing side now feels closer to a real product site.
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Instead of asking one page to do everything, the site now has a cleaner overview plus dedicated detail pages that better match the portal’s depth and polish.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] px-6 text-sm font-semibold text-white shadow-[0_20px_34px_-22px_rgba(59,130,246,0.75)] transition hover:brightness-[1.03]"
          >
            Create account
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[rgba(68,111,255,0.16)] bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Back to home
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
