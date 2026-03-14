import type { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";
import { themeLayoutClasses } from "@/theme";

interface PostLoginShellProps {
  currentPath: string;
  children: ReactNode;
}

export function PostLoginShell({ currentPath, children }: PostLoginShellProps) {
  return (
    <div className={themeLayoutClasses.pageFrame}>
      <div className={themeLayoutClasses.container}>
        <AppNav currentPath={currentPath} />
        <main className={themeLayoutClasses.main}>{children}</main>
      </div>
    </div>
  );
}

