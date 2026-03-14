import type { Metadata } from "next";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { patientJourney } from "@/lib/mock-data";
import { appTheme, cx, themeClassNames, themeLayoutClasses } from "@/theme";

export const metadata: Metadata = {
  title: "AI Specialty Medication Landing Page",
  description:
    "MediConnect helps patients and providers move from a clear landing page into sign-in, sign-up, and a structured role-aware dashboard.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MediConnect | Landing to dashboard flow",
    description:
      "A patient-first care coordination MVP with a proper landing page, auth flow, and role-based dashboard structure.",
    url: "/",
    siteName: appTheme.brand.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediConnect | Landing to dashboard flow",
    description:
      "Landing page, auth flow, and role-aware dashboard structure for specialty care coordination.",
  },
};

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { patient, provider, medication, profile, providerSummary, careTasks, reminders } =
    patientJourney;

  const heroStats = [
    {
      label: "Flow",
      value: "Landing -> Auth -> Dashboard",
      detail: "The first-time journey is visible before the user creates an account.",
    },
    {
      label: "Roles",
      value: "Patient + Provider",
      detail: "One product structure with role-aware panels after sign-in.",
    },
    {
      label: "AI help",
      value: "Guidance only",
      detail: "AI explains, summarizes, and drafts without making clinical decisions.",
    },
  ];

  const journeySteps = [
    {
      title: "Start on the landing page",
      detail:
        "Users first understand what MediConnect does, who it helps, and what happens next.",
    },
    {
      title: "Choose sign in or sign up",
      detail:
        "Auth is intentionally short so the product story happens on the marketing page, not inside the form.",
    },
    {
      title: "Enter the structured dashboard",
      detail:
        "After sign-in, the user sees a branded header, a sidebar, and role-wise panels in a proper app shell.",
    },
  ];

  const roleCards = [
    {
      eyebrow: "Patient view",
      title: "A calm dashboard that answers: what do I do next?",
      detail:
        "Patients see medication instructions, reminders, support, and drafted questions in one place.",
      points: [
        `Follow a clearer start plan for ${medication.name}.`,
        "Track reminders and refill timing without extra clicks.",
        "Open support and message drafts from the same sidebar.",
      ],
      ctaHref: "/sign-up",
      ctaLabel: "Create patient account",
      tone: "accent" as const,
    },
    {
      eyebrow: "Provider view",
      title: "A review workspace built for quick follow-up.",
      detail:
        "Providers use the same routes, but the side panel and dashboard blocks focus on patient status, risk, and outreach.",
      points: [
        "Scan blockers and adherence context immediately.",
        "Use AI summaries to prep outreach faster.",
        "Move from review to message draft without leaving the workspace.",
      ],
      ctaHref: "/sign-in",
      ctaLabel: "Open provider flow",
      tone: "warning" as const,
    },
  ];

  const workspaceModules = [
    {
      title: "Shared dashboard",
      detail: "Overview cards, activity counts, and next actions for the signed-in role.",
    },
    {
      title: "Sidebar navigation",
      detail: "Core care routes stay visible so users can move through the flow without getting lost.",
    },
    {
      title: "Role panel",
      detail: "Patients get guidance and support actions; providers get review and follow-up actions.",
    },
    {
      title: "Branded header",
      detail: "Logo, account access, and session controls are always visible after sign-in.",
    },
  ];

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: appTheme.brand.name,
    url: siteUrl,
    description:
      "MediConnect is a patient-first specialty medication care coordination MVP with a clean landing page, auth flow, and role-based dashboard.",
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
      "MediConnect guides patients and providers from first visit to dashboard with clearer specialty medication coordination.",
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
          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className={themeClassNames.heroCard}>
              <div className="mb-5 flex flex-wrap gap-3">
                <StatusPill tone="accent">Landing page first</StatusPill>
                <StatusPill>Role-aware dashboard after sign-in</StatusPill>
              </div>
              <h1 className={cx("max-w-4xl", themeClassNames.text.headingHero)}>
                MediConnect now starts like a real product: landing page, auth flow, then a proper dashboard shell.
              </h1>
              <p className={cx("mt-5 max-w-3xl", themeClassNames.text.bodyLarge)}>
                The MVP stays simple for the hackathon. New users learn the product on the landing page, move into sign-in or sign-up, and then enter a branded workspace with a header, sidebar, and role-wise panels.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/sign-up" className={themeClassNames.primaryButton}>
                  Create account
                </Link>
                <Link href="/sign-in" className={themeClassNames.secondaryButton}>
                  Sign in
                </Link>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className={themeClassNames.metricTile}>
                    <p className={themeClassNames.text.label}>{stat.label}</p>
                    <p className={cx("mt-3 text-xl font-semibold tracking-[-0.03em] text-[var(--foreground-strong)]")}>
                      {stat.value}
                    </p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <SectionCard
              eyebrow="Live demo story"
              title={`${patient.name} begins therapy with ${provider.name}`}
              description="The first screen should already explain the core product story before the user hits auth."
            >
              <div className={themeClassNames.darkPanel}>
                <p className={themeClassNames.text.onDarkLabel}>Current demo snapshot</p>
                <p className={cx("mt-3", themeClassNames.text.onDarkHero)}>
                  {profile.therapyStatus}
                </p>
                <p className={cx("mt-3", themeClassNames.text.onDarkBody)}>
                  {patient.name} is preparing for {medication.frequency.toLowerCase()} dosing and needs a cleaner checklist, reminder timing, and a simple way to ask questions.
                </p>
              </div>
              <div className="mt-5 space-y-3">
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>Medication</p>
                  <p className={cx("mt-1", themeClassNames.text.body)}>
                    {medication.name} · {medication.dosage}
                  </p>
                </div>
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>Next appointment</p>
                  <p className={cx("mt-1", themeClassNames.text.body)}>
                    {profile.nextAppointmentAt}
                  </p>
                </div>
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>Provider summary</p>
                  <p className={cx("mt-1", themeClassNames.text.body)}>
                    {providerSummary.adherenceTrend}
                  </p>
                </div>
              </div>
            </SectionCard>
          </section>

          <section id="how-it-works" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] scroll-mt-28">
            <SectionCard
              eyebrow="Product structure"
              title="The app flow is now easier to understand from the first visit"
              description="This is the order users follow across desktop and mobile."
            >
              <div className="grid gap-4 md:grid-cols-3">
                {journeySteps.map((step, index) => (
                  <div key={step.title} className={themeClassNames.softPanel}>
                    <div className={themeClassNames.logoBadge}>0{index + 1}</div>
                    <h2 className={cx("mt-4", themeClassNames.text.headingCard)}>
                      {step.title}
                    </h2>
                    <p className={cx("mt-2", themeClassNames.text.body)}>{step.detail}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Why it matters"
              title="The MVP feels more like a guided healthcare product and less like a route list"
              description="The structure is optimized for a short, understandable hackathon demo."
            >
              <div className="space-y-3">
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>Patients get clarity faster</p>
                  <p className={cx("mt-2", themeClassNames.text.body)}>
                    The landing page explains the value, while the dashboard keeps next steps, reminders, and support in one place.
                  </p>
                </div>
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>Providers get cleaner review surfaces</p>
                  <p className={cx("mt-2", themeClassNames.text.body)}>
                    Shared routes stay in place, but the provider role switches the right actions and summaries on sign-in.
                  </p>
                </div>
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>AI stays human-in-the-loop</p>
                  <p className={cx("mt-2", themeClassNames.text.body)}>
                    AI prepares explanations, checklists, and drafts while people still make the decisions.
                  </p>
                </div>
              </div>
            </SectionCard>
          </section>

          <section id="role-panels" className="grid gap-6 xl:grid-cols-2 scroll-mt-28">
            {roleCards.map((card) => (
              <SectionCard
                key={card.title}
                eyebrow={card.eyebrow}
                title={card.title}
                description={card.detail}
              >
                <div className="mb-5 flex flex-wrap gap-3">
                  <StatusPill tone={card.tone}>{card.eyebrow}</StatusPill>
                  <StatusPill>Role-wise panel</StatusPill>
                </div>
                <div className="space-y-3">
                  {card.points.map((point) => (
                    <div key={point} className={themeClassNames.subtlePanel}>
                      <p className={themeClassNames.text.body}>{point}</p>
                    </div>
                  ))}
                </div>
                <Link href={card.ctaHref} className={cx("mt-5", themeClassNames.primaryButtonCompact)}>
                  {card.ctaLabel}
                </Link>
              </SectionCard>
            ))}
          </section>

          <section id="dashboard-preview" className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr] scroll-mt-28">
            <SectionCard
              eyebrow="Dashboard preview"
              title="What users see after sign-in"
              description="The signed-in experience now has a clearer information hierarchy."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {workspaceModules.map((module) => (
                  <div key={module.title} className={themeClassNames.softPanel}>
                    <p className={themeClassNames.text.bodyStrong}>{module.title}</p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>{module.detail}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Sample dashboard content"
              title="The right panel changes by role"
              description="This keeps the layout stable while making the content feel tailored."
            >
              <div className="space-y-3">
                {careTasks.slice(0, 2).map((task) => (
                  <div key={task.id} className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.bodyStrong}>{task.title}</p>
                    <p className={cx("mt-1", themeClassNames.text.body)}>{task.description}</p>
                  </div>
                ))}
                {reminders.slice(0, 2).map((reminder) => (
                  <div key={reminder.id} className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.bodyStrong}>{reminder.title}</p>
                    <p className={cx("mt-1", themeClassNames.text.body)}>
                      {reminder.window} · {reminder.channel}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <SectionCard
              eyebrow="Final CTA"
              title="Start from the landing page, then move into auth and the dashboard"
              description="That sequence gives the product a cleaner and more believable structure."
            >
              <div className="space-y-3">
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.body}>New users should begin with account creation from this page.</p>
                </div>
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.body}>Returning users can sign in and land directly in the structured dashboard shell.</p>
                </div>
              </div>
            </SectionCard>

            <div className={themeClassNames.heroCard}>
              <div className="mb-5 flex flex-wrap gap-3">
                <StatusPill tone="accent">Ready to demo</StatusPill>
                <StatusPill>Desktop and mobile</StatusPill>
              </div>
              <h2 className={themeClassNames.text.headingSection}>
                Use the new entry flow now.
              </h2>
              <p className={cx("mt-4", themeClassNames.text.bodyLarge)}>
                Open sign-up for the first-time story, or sign in to test the new dashboard structure with the branded header, sidebar, and role-wise panel layout.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/sign-up" className={themeClassNames.primaryButton}>
                  Create account
                </Link>
                <Link href="/sign-in" className={themeClassNames.secondaryButton}>
                  Sign in
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
