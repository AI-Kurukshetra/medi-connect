import type { Metadata } from "next";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { patientJourney } from "@/lib/mock-data";
import { appTheme, cx, themeClassNames, themeLayoutClasses } from "@/theme";

export const metadata: Metadata = {
  title: "AI Care Coordination Landing Page",
  description:
    "MediConnect now opens with a stronger landing page, cleaner auth entry, and a structured dashboard workspace for patients and providers.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MediConnect | Landing page to care workspace",
    description:
      "A patient-first specialty medication MVP with a refined landing page and a proper role-aware dashboard shell.",
    url: "/",
    siteName: appTheme.brand.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediConnect | Landing page to care workspace",
    description:
      "Refined landing page, auth flow, and role-aware dashboard shell for specialty care coordination.",
  },
};

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { patient, provider, profile, medication, aiInsights, careTasks, reminders, providerSummary } =
    patientJourney;

  const signalCards = [
    {
      label: "Entry flow",
      value: "Landing -> Auth -> Workspace",
      detail: "The first-time experience is now easy to explain in a demo.",
    },
    {
      label: "Primary roles",
      value: "Patient + Provider",
      detail: "One product shell, two perspectives, less duplication.",
    },
    {
      label: "AI role",
      value: "Explain, draft, summarize",
      detail: "AI reduces confusion without replacing human decisions.",
    },
  ];

  const storyBlocks = [
    {
      title: "Patients feel oriented faster",
      detail:
        "The first screen frames the medication journey clearly before the user sees a form or dashboard module.",
    },
    {
      title: "Providers review from the same workspace",
      detail:
        "Shared routes keep the demo simple while the dashboard panels shift to the right provider actions.",
    },
    {
      title: "Every screen points to the next step",
      detail:
        "The MVP stays focused on what happens next, not enterprise workflow depth.",
    },
  ];

  const workspacePanels = [
    {
      title: "Header",
      detail: "Brand, session context, support, and account actions stay visible after sign-in.",
    },
    {
      title: "Sidebar",
      detail: "Dashboard, tasks, reminders, messages, support, account, and role panels all stay in one navigation system.",
    },
    {
      title: "Role panel",
      detail: "Patients see guidance and support prompts; providers see risk, outreach, and review actions.",
    },
    {
      title: "Main canvas",
      detail: "Each route opens inside the same shell so the structure feels consistent across the app.",
    },
  ];

  const roleBoards = [
    {
      eyebrow: "Patient board",
      title: "A calmer therapy start experience",
      detail:
        "The patient flow focuses on medication instructions, reminders, support, and one next-step board.",
      tone: "accent" as const,
      points: [
        aiInsights[0]?.summary ?? "Review your next medication steps in plain language.",
        `${medication.name} refill due in ${medication.refillDueInDays} days.`,
        `Next follow-up: ${profile.nextAppointmentAt}.`,
      ],
      ctaHref: "/sign-up",
      ctaLabel: "Create patient access",
    },
    {
      eyebrow: "Provider board",
      title: "A faster care review surface",
      detail:
        "The provider flow keeps blockers, adherence context, and drafted follow-up close to the main dashboard.",
      tone: "warning" as const,
      points: [
        providerSummary.adherenceTrend,
        providerSummary.recommendedAction,
        `Current review patient: ${patient.name}.`,
      ],
      ctaHref: "/sign-in",
      ctaLabel: "Open provider sign in",
    },
  ];

  const launchChecklist = [
    "Open the landing page and explain the product in under 20 seconds.",
    "Create or sign in to an account from the hero CTA.",
    "Show the branded dashboard shell with sidebar and role-wise panels.",
    "Move through tasks, reminders, messages, and support without changing layout patterns.",
  ];

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: appTheme.brand.name,
    url: siteUrl,
    description:
      "MediConnect is a specialty medication care coordination MVP with a refined landing page, authentication flow, and role-aware dashboard workspace.",
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
      "MediConnect guides patients and providers through specialty medication onboarding, reminders, and follow-up in one structured interface.",
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
          <section className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
            <div className={themeClassNames.heroCard}>
              <div className="mb-6 flex flex-wrap gap-3">
                <StatusPill tone="accent">Refined landing page</StatusPill>
                <StatusPill>Proper dashboard structure</StatusPill>
              </div>
              <h1 className={cx("max-w-4xl", themeClassNames.text.headingHero)}>
                Specialty care now starts with a clear landing page and ends in a real workspace.
              </h1>
              <p className={cx("mt-5 max-w-3xl", themeClassNames.text.bodyLarge)}>
                MediConnect now feels like a product, not just a list of routes. New users learn the story first, move into sign-in or sign-up, and then land inside a branded dashboard with a header, sidebar, support access, account controls, and role-wise panels.
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
                {signalCards.map((item) => (
                  <div key={item.label} className={themeClassNames.metricTile}>
                    <p className={themeClassNames.text.label}>{item.label}</p>
                    <p className={cx("mt-3 text-xl font-semibold tracking-[-0.04em] text-[var(--foreground-strong)]")}>
                      {item.value}
                    </p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <section className="space-y-6">
              <div className={themeClassNames.darkPanel}>
                <p className={themeClassNames.text.onDarkLabel}>Live demo story</p>
                <h2 className={cx("mt-3", themeClassNames.text.onDarkHero)}>
                  {patient.name} begins {medication.name} with {provider.name} in one connected flow.
                </h2>
                <p className={cx("mt-4", themeClassNames.text.onDarkBody)}>
                  {profile.therapyStatus}. The new UI keeps preparation, reminders, support, and follow-up aligned inside one product journey.
                </p>
                <div className="mt-6 grid gap-3">
                  <div className="rounded-[22px] border border-white/12 bg-white/8 p-4">
                    <p className={themeClassNames.text.onDarkLabel}>Condition</p>
                    <p className={cx("mt-1", themeClassNames.text.onDarkBody)}>{profile.condition}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/12 bg-white/8 p-4">
                    <p className={themeClassNames.text.onDarkLabel}>Next visit</p>
                    <p className={cx("mt-1", themeClassNames.text.onDarkBody)}>{profile.nextAppointmentAt}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/12 bg-white/8 p-4">
                    <p className={themeClassNames.text.onDarkLabel}>Provider signal</p>
                    <p className={cx("mt-1", themeClassNames.text.onDarkBody)}>{providerSummary.adherenceTrend}</p>
                  </div>
                </div>
              </div>

              <div className={themeClassNames.sidebarCard}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className={themeClassNames.text.eyebrow}>At-a-glance flow</p>
                    <h2 className={cx("mt-2", themeClassNames.text.headingPanel)}>
                      First visit to signed-in workspace
                    </h2>
                  </div>
                  <div className={themeClassNames.chip}>3 screens</div>
                </div>
                <div className="space-y-3">
                  <div className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.bodyStrong}>01 Landing page</p>
                    <p className={cx("mt-1", themeClassNames.text.body)}>
                      Explain value, roles, and the care journey before asking the user to log in.
                    </p>
                  </div>
                  <div className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.bodyStrong}>02 Auth screen</p>
                    <p className={cx("mt-1", themeClassNames.text.body)}>
                      Keep sign-in and sign-up short so the form does not carry the whole product story.
                    </p>
                  </div>
                  <div className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.bodyStrong}>03 Dashboard workspace</p>
                    <p className={cx("mt-1", themeClassNames.text.body)}>
                      Open the header, sidebar, account, support, and role-specific modules in one consistent shell.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </section>

          <section id="story" className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] scroll-mt-28">
            <SectionCard
              eyebrow="Why this matters"
              title="The experience now tells a stronger story before any dashboard module opens"
              description="The landing page is rebuilt to frame the product like a real patient and provider tool."
            >
              <div className="space-y-3">
                {storyBlocks.map((block) => (
                  <div key={block.title} className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.bodyStrong}>{block.title}</p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>{block.detail}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Patient journey"
              title="A better first-run narrative"
              description="The landing screen now mirrors the actual demo flow that follows after authentication."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {careTasks.slice(0, 2).map((task) => (
                  <div key={task.id} className={themeClassNames.softPanel}>
                    <p className={themeClassNames.text.label}>{task.status}</p>
                    <p className={cx("mt-2", themeClassNames.text.bodyStrong)}>{task.title}</p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>{task.description}</p>
                  </div>
                ))}
                {reminders.slice(0, 2).map((reminder) => (
                  <div key={reminder.id} className={themeClassNames.softPanel}>
                    <p className={themeClassNames.text.label}>{reminder.channel}</p>
                    <p className={cx("mt-2", themeClassNames.text.bodyStrong)}>{reminder.title}</p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>{reminder.window}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </section>

          <section id="roles" className="grid gap-6 xl:grid-cols-2 scroll-mt-28">
            {roleBoards.map((board) => (
              <SectionCard
                key={board.title}
                eyebrow={board.eyebrow}
                title={board.title}
                description={board.detail}
              >
                <div className="mb-5 flex flex-wrap gap-2">
                  <StatusPill tone={board.tone}>{board.eyebrow}</StatusPill>
                  <StatusPill>Role-wise panel</StatusPill>
                </div>
                <div className="space-y-3">
                  {board.points.map((point) => (
                    <div key={point} className={themeClassNames.subtlePanel}>
                      <p className={themeClassNames.text.body}>{point}</p>
                    </div>
                  ))}
                </div>
                <Link href={board.ctaHref} className={cx("mt-5", themeClassNames.primaryButtonCompact)}>
                  {board.ctaLabel}
                </Link>
              </SectionCard>
            ))}
          </section>

          <section id="workspace" className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] scroll-mt-28">
            <SectionCard
              eyebrow="Dashboard shell"
              title="After sign-in, every main component lives inside the sidebar and header structure"
              description="This is the foundation for dashboard, tasks, reminders, messages, support, account, and role panels."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {workspacePanels.map((panel) => (
                  <div key={panel.title} className={themeClassNames.softPanel}>
                    <p className={themeClassNames.text.bodyStrong}>{panel.title}</p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>{panel.detail}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Demo payoff"
              title="The UI now supports a cleaner walkthrough"
              description="A stronger shell lets you show more features without the app feeling scattered."
            >
              <div className="space-y-3">
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>Navigation stays familiar</p>
                  <p className={cx("mt-2", themeClassNames.text.body)}>
                    Support, account, patient tools, provider tools, and shared modules remain in one visible layout.
                  </p>
                </div>
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>The dashboard becomes the control center</p>
                  <p className={cx("mt-2", themeClassNames.text.body)}>
                    Users can move between summary cards, care tasks, reminders, and outreach without losing context.
                  </p>
                </div>
                <div className={themeClassNames.subtlePanel}>
                  <p className={themeClassNames.text.bodyStrong}>The structure is demo-friendly</p>
                  <p className={cx("mt-2", themeClassNames.text.body)}>
                    It is now much easier to explain the app flow live or in a pitch deck.
                  </p>
                </div>
              </div>
            </SectionCard>
          </section>

          <section id="launch" className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] scroll-mt-28">
            <SectionCard
              eyebrow="Launch checklist"
              title="How to demo the refreshed UI"
              description="Use this sequence to show the new structure clearly."
            >
              <div className="space-y-3">
                {launchChecklist.map((item, index) => (
                  <div key={item} className={themeClassNames.subtlePanel}>
                    <p className={themeClassNames.text.label}>Step 0{index + 1}</p>
                    <p className={cx("mt-2", themeClassNames.text.body)}>{item}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className={themeClassNames.heroCard}>
              <div className="mb-5 flex flex-wrap gap-3">
                <StatusPill tone="accent">Ready for the next build</StatusPill>
                <StatusPill>Desktop and mobile</StatusPill>
              </div>
              <h2 className={themeClassNames.text.headingSection}>
                Start from the landing page and move straight into the new workspace.
              </h2>
              <p className={cx("mt-4 max-w-2xl", themeClassNames.text.bodyLarge)}>
                The whole experience is now better sequenced: a refined landing page, focused sign-in and sign-up screens, then a structured post-login dashboard with sidebar navigation, support access, account controls, and role-aware panels.
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
