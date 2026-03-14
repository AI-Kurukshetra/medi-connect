import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { patientJourney } from "@/lib/mock-data";
import { cx, themeClassNames } from "@/theme";

interface ModuleOverviewProps {
  roleMode: "patient" | "provider";
  eyebrow: string;
  title: string;
  description: string;
  apiRoutes: string[];
  points: string[];
}

export function ModuleOverview({
  roleMode,
  eyebrow,
  title,
  description,
  apiRoutes,
  points,
}: ModuleOverviewProps) {
  const sideNote =
    roleMode === "provider"
      ? patientJourney.providerSummary.recommendedAction
      : (patientJourney.aiInsights[0]?.summary ?? "Review your next medication steps in plain language.");

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow={eyebrow}
          title={title}
          description={description}
        >
          <div className="mb-5 flex flex-wrap gap-2">
            <StatusPill tone="accent">{roleMode} mode</StatusPill>
            <StatusPill>Shared workspace route</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {points.map((point) => (
              <div key={point} className={themeClassNames.softPanel}>
                <p className={themeClassNames.text.body}>{point}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Right now"
          title={roleMode === "provider" ? "Provider follow-up lane" : "Patient next-step lane"}
          description={sideNote}
        >
          <div className="space-y-3">
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.bodyStrong}>Why this module matters</p>
              <p className={cx("mt-2", themeClassNames.text.body)}>
                The route lives inside the same header and sidebar structure, so users never lose their place.
              </p>
            </div>
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.bodyStrong}>How to present it</p>
              <p className={cx("mt-2", themeClassNames.text.body)}>
                Show the module content, then point back to the sidebar to reinforce the unified dashboard shell.
              </p>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        eyebrow="Connected routes"
        title="API surfaces and adapters behind this screen"
        description="These endpoints are still available, but the UI now frames them inside a cleaner product layer."
      >
        <div className="flex flex-wrap gap-3">
          {apiRoutes.map((route) => (
            <span key={route} className={themeClassNames.chip}>
              {route}
            </span>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
