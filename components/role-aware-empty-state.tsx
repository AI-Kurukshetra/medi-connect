import Link from "next/link";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { cx, themeClassNames } from "@/theme";

interface RoleAwareEmptyStateProps {
  roleMode: "patient" | "provider";
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}

export function RoleAwareEmptyState({
  roleMode,
  title,
  description,
  ctaHref,
  ctaLabel,
}: RoleAwareEmptyStateProps) {
  return (
    <SectionCard
      className={themeClassNames.heroSectionCard}
      eyebrow={`${roleMode} workspace`}
      title={title}
      description={description}
    >
      <div className="mb-5 flex flex-wrap gap-2">
        <StatusPill tone="warning">Missing live data</StatusPill>
        <StatusPill>{roleMode} mode</StatusPill>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className={themeClassNames.softPanel}>
          <p className={themeClassNames.text.bodyStrong}>Next best action</p>
          <p className={cx("mt-2", themeClassNames.text.body)}>
            Use the CTA to move back into the main workspace and continue the demo without breaking the layout.
          </p>
        </div>
        <Link href={ctaHref} className={themeClassNames.primaryButtonCompact}>
          {ctaLabel}
        </Link>
      </div>
    </SectionCard>
  );
}
