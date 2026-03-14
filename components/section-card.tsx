import type { ReactNode } from "react";
import { cx, themeClassNames } from "@/theme";

interface SectionCardProps {
  title: string;
  eyebrow?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

export function SectionCard({
  title,
  eyebrow,
  description,
  className,
  children,
}: SectionCardProps) {
  const classes = cx(themeClassNames.sectionCard, className);

  return (
    <section className={classes}>
      {eyebrow ? (
        <p className={themeClassNames.text.eyebrow}>
          {eyebrow}
        </p>
      ) : null}
      <div className={eyebrow ? "mt-3" : undefined}>
        <h2 className={themeClassNames.text.headingSection}>{title}</h2>
        {description ? (
          <p className={cx("mt-2 max-w-2xl", themeClassNames.text.body)}>
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
