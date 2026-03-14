import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { themeClassNames } from "@/theme";

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
  return (
    <SectionCard eyebrow={eyebrow} title={title} description={description}>
      <div className="mb-4 flex flex-wrap gap-2">
        <StatusPill tone="accent">{roleMode} mode</StatusPill>
        <StatusPill>Mock-first adapters</StatusPill>
      </div>
      <div className="space-y-2">
        {points.map((point) => (
          <div key={point} className={themeClassNames.subtlePanel}>
            <p className={themeClassNames.text.body}>{point}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-2">
        {apiRoutes.map((route) => (
          <p key={route} className={themeClassNames.text.label}>
            {route}
          </p>
        ))}
      </div>
    </SectionCard>
  );
}

