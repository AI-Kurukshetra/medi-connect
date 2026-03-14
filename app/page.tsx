import type { Metadata } from "next";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { patientJourney } from "@/lib/mock-data";
import {
  appTheme,
  cx,
  themeClassNames,
  themeLayoutClasses,
} from "@/theme";

export const metadata: Metadata = {
  title: "Specialty Medication Care Platform",
  description:
    "MediConnect helps patients and providers simplify specialty medication onboarding, reminders, and follow-up with clear next-step guidance.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MediConnect | Specialty Medication Care Platform",
    description:
      "A patient-first platform for specialty medication onboarding, reminders, and provider follow-up.",
    url: "/",
    siteName: appTheme.brand.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediConnect | Specialty Medication Care Platform",
    description:
      "Patient-first specialty medication onboarding, reminders, and provider follow-up.",
  },
};

export default function Home() {
  const { patient, provider, medication, profile } = patientJourney;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const heroStats = [
    {
      label: "Patient-first flow",
      value: "Simple",
      detail: "Landing page, account creation, onboarding, reminders, and follow-up.",
    },
    {
      label: "Core users",
      value: "2 roles",
      detail: "Patients and providers see the same product from their own angle.",
    },
    {
      label: "AI support",
      value: "Focused",
      detail: "Used for guidance, summaries, checklists, and draft communication.",
    },
  ];

  const platformSections = [
    {
      title: "Patient onboarding",
      detail:
        "Turn dense medication instructions into a small set of clear next steps for the patient.",
    },
    {
      title: "Medication reminders",
      detail:
        "Keep the user on track for first dose, refill timing, and upcoming care-team touchpoints.",
    },
    {
      title: "Provider visibility",
      detail:
        "Show blockers, adherence context, and drafted outreach without forcing long case review.",
    },
    {
      title: "Chatbot support",
      detail:
        "Answer plain-language questions, draft messages, and explain what to do next.",
    },
  ];

  const journeySteps = [
    {
      title: "Landing page",
      detail:
        "Explain what MediConnect does, who it is for, and why it is easier than typical specialty workflows.",
    },
    {
      title: "Sign in or sign up",
      detail:
        "Create a patient or provider account with just the minimum information needed to begin.",
    },
    {
      title: "Role-based experience",
      detail:
        "Both roles land on one shared route map. The same URLs render role-aware content and actions.",
    },
    {
      title: "AI-assisted support",
      detail:
        "The assistant helps with summaries, reminders, education, and drafts without taking control away from the user.",
    },
  ];

  const useCases = [
    "A patient creates an account and immediately sees the first therapy steps.",
    "A patient checks medication instructions, reminders, and the next appointment in one place.",
    "A patient asks a support question without reading through complex documents.",
    "A provider opens one panel and sees blockers, risk hints, and a ready draft message.",
    "A provider reviews patient onboarding progress before the first dose.",
    "The team deploys one clean web experience instead of building a complex enterprise platform.",
  ];

  const roleViews = [
    {
      eyebrow: "Patient experience",
      title: "Clear guidance from day one",
      detail:
        "Show medication details, open care tasks, reminder timing, and AI help in one calm dashboard.",
      cta: "Open shared dashboard",
      href: "/dashboard",
      tone: "accent" as const,
      points: [
        "Checklist-based onboarding",
        "Reminder and refill visibility",
        "Question drafting for the care team",
      ],
    },
    {
      eyebrow: "Provider experience",
      title: "Fast review without the noise",
      detail:
        "Surface blockers, adherence context, and drafted follow-up so the provider can act quickly.",
      cta: "Open shared dashboard",
      href: "/dashboard",
      tone: "warning" as const,
      points: [
        "Quick patient status review",
        "AI visit brief and outreach draft",
        "Human-controlled follow-up decisions",
      ],
    },
  ];

  const guardrails = [
    "AI explains and drafts. It does not diagnose or make treatment decisions.",
    "The MVP focuses on onboarding, reminders, and follow-up instead of billing or insurance operations.",
    "Every screen should make the next user action obvious in one glance.",
  ];

  const faqItems = [
    {
      question: "What does MediConnect do?",
      answer:
        "MediConnect simplifies specialty medication onboarding, reminders, and provider follow-up so users can clearly see the next step.",
    },
    {
      question: "Who is MediConnect built for?",
      answer:
        "The MVP supports two roles: patients managing therapy start and providers reviewing progress and follow-up.",
    },
    {
      question: "Does AI make clinical decisions in this product?",
      answer:
        "No. AI is used for explanation, summaries, and drafting. Clinical decisions remain with human care teams.",
    },
    {
      question: "What is the first user flow?",
      answer:
        "Landing page first, then sign in or sign up, then one shared dashboard with role-aware modules.",
    },
  ];

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: appTheme.brand.name,
    url: siteUrl,
    description:
      "Specialty medication onboarding, reminders, and provider follow-up in one patient-first platform.",
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
      "MediConnect helps patients and providers coordinate specialty medication onboarding, reminders, and follow-up.",
    url: siteUrl,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <AppNav currentPath="/" />
        <main className={themeLayoutClasses.main}>
          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className={themeClassNames.heroCard}>
              <div className="mb-5 flex flex-wrap gap-3">
                <StatusPill tone="accent">Specialty care platform</StatusPill>
                <StatusPill>Landing first, auth second</StatusPill>
              </div>
              <h1 className={cx("max-w-4xl", themeClassNames.text.headingHero)}>
                MediConnect makes specialty medication onboarding easier to
                understand for both patients and providers.
              </h1>
              <p className={cx("mt-5 max-w-3xl", themeClassNames.text.bodyLarge)}>
                Start with a clear platform overview, move into sign-in or
                sign-up, then guide each role into the right next-step
                experience. The product is designed to reduce confusion, not add
                more workflow complexity.
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
                    <p className={cx("mt-3", themeClassNames.text.headingMetric)}>
                      {stat.value}
                    </p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>
                      {stat.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <SectionCard
              eyebrow="Platform overview"
              title="What the product already communicates"
              description="This is the story the landing page should tell before the user reaches auth."
            >
              <div className={themeClassNames.darkPanel}>
                <p className={themeClassNames.text.onDarkLabel}>Sample journey</p>
                <p className={cx("mt-3", themeClassNames.text.onDarkHero)}>
                  {patient.name} creates an account, sees her {medication.name}{" "}
                  plan, confirms reminder timing, and stays aligned with{" "}
                  {provider.name}.
                </p>
                <p className={cx("mt-4", themeClassNames.text.onDarkBody)}>
                  Current demo condition: {profile.condition}. Current therapy
                  status: {profile.therapyStatus}.
                </p>
              </div>
              <div className="mt-5 space-y-3">
                {platformSections.map((item) => (
                  <div key={item.title} className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.bodyStrong}>
                      {item.title}
                    </p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <SectionCard
              eyebrow="How the platform works"
              title="The user journey should feel obvious from the first visit"
              description="This is the recommended order of screens for the MVP."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {journeySteps.map((step, index) => (
                  <div key={step.title} className={themeClassNames.softPanel}>
                    <div className={themeClassNames.logoBadge}>0{index + 1}</div>
                    <h3 className={cx("mt-4", themeClassNames.text.headingCard)}>
                      {step.title}
                    </h3>
                    <p className={cx("mt-2", themeClassNames.text.body)}>
                      {step.detail}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Main use cases"
              title="What the landing page should explain clearly"
              description="These are the outcomes users should understand before they create an account."
            >
              <div className="space-y-3">
                {useCases.map((useCase) => (
                  <div key={useCase} className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.body}>{useCase}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            {roleViews.map((roleView) => (
              <SectionCard
                key={roleView.title}
                eyebrow={roleView.eyebrow}
                title={roleView.title}
                description={roleView.detail}
              >
                <div className="mb-5 flex flex-wrap gap-3">
                  <StatusPill tone={roleView.tone}>{roleView.eyebrow}</StatusPill>
                  <StatusPill>Responsive panel</StatusPill>
                </div>
                <div className="space-y-3">
                  {roleView.points.map((point) => (
                    <div key={point} className={themeClassNames.subtlePanel}>
                      <p className={themeClassNames.text.body}>{point}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href={roleView.href}
                  className={cx("mt-5", themeClassNames.primaryButtonCompact)}
                >
                  {roleView.cta}
                </Link>
              </SectionCard>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <SectionCard
              eyebrow="Why this product matters"
              title="The platform should feel like a healthcare guide, not a workflow engine"
              description="The landing page needs to explain both the value and the boundaries of the MVP."
            >
              <div className="space-y-3">
                {guardrails.map((guardrail) => (
                  <div key={guardrail} className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.body}>{guardrail}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className={themeClassNames.heroCard}>
              <div className="mb-5 flex flex-wrap gap-3">
                <StatusPill tone="accent">Ready to enter the app</StatusPill>
                <StatusPill>Responsive first step</StatusPill>
              </div>
              <h2 className={themeClassNames.text.headingSection}>
                Start with the landing page. Then move into sign-in or sign-up.
              </h2>
              <p className={cx("mt-4", themeClassNames.text.bodyLarge)}>
                This keeps the product flow understandable: explain the
                platform, show the use cases, then let the user create an
                account or return to their care plan.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/sign-up" className={themeClassNames.primaryButton}>
                  Get started
                </Link>
                <Link href="/sign-in" className={themeClassNames.secondaryButton}>
                  I already have an account
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <SectionCard
              eyebrow="Frequently asked questions"
              title="Common questions before sign in or sign up"
              description="This section helps new users understand the platform quickly."
            >
              <div className="space-y-3">
                {faqItems.map((faq) => (
                  <div key={faq.question} className={themeClassNames.subtlePanel}>
                    <h3 className={themeClassNames.text.headingCard}>
                      {faq.question}
                    </h3>
                    <p className={cx("mt-2", themeClassNames.text.body)}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Start now"
              title="Ready to explore MediConnect?"
              description="Use the same entry flow on desktop and mobile."
            >
              <div className={themeClassNames.softPanel}>
                <p className={themeClassNames.text.body}>
                  New users should create an account first. Returning users can
                  sign in and continue from where they left off.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link href="/sign-up" className={themeClassNames.primaryButton}>
                    Create account
                  </Link>
                  <Link
                    href="/sign-in"
                    className={themeClassNames.secondaryButton}
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </SectionCard>
          </section>
        </main>
      </div>
    </div>
  );
}
