import Link from "next/link";
import { SectionCard } from "@/components/section-card";
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
      eyebrow={`${roleMode} mode`}
      title={title}
      description={description}
    >
      <Link href={ctaHref} className={cx(themeClassNames.secondaryButtonCompact)}>
        {ctaLabel}
      </Link>
    </SectionCard>
  );
}

