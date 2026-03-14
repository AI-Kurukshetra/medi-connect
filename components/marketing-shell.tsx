import type { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { themeLayoutClasses } from "@/theme";

interface MarketingShellProps {
  currentPath: string;
  children: ReactNode;
}

export function MarketingShell({ currentPath, children }: MarketingShellProps) {
  return (
    <div className={themeLayoutClasses.pageFrame}>
      <div className={themeLayoutClasses.container}>
        <AppNav currentPath={currentPath} />
        <main className={themeLayoutClasses.main}>{children}</main>
        <MarketingFooter />
      </div>
    </div>
  );
}
