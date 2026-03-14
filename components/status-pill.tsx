import type { ReactNode } from "react";
import { statusToneClasses } from "@/theme";

export type StatusPillTone = keyof typeof statusToneClasses;

interface StatusPillProps {
  children: ReactNode;
  tone?: StatusPillTone;
}

export function StatusPill({
  children,
  tone = "neutral",
}: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full text-xs font-semibold uppercase tracking-[0.18em] ${statusToneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
