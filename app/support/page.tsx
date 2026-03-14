import type { Metadata } from "next";
import { PostLoginShell } from "@/components/post-login-shell";
import { SectionCard } from "@/components/section-card";
import { SupportChat } from "@/components/support-chat";
import { StatusPill } from "@/components/status-pill";
import { requireAuthContext } from "@/lib/auth/server";
import { patientJourney } from "@/lib/mock-data";
import { cx, themeClassNames } from "@/theme";

export const metadata: Metadata = {
  title: "Support",
  alternates: { canonical: "/support" },
};

export default async function SupportPage() {
  const context = await requireAuthContext();

  return (
    <PostLoginShell currentPath="/support">
      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow={`${context.role} support`}
          title="Support center"
          description="Support is now part of the same dashboard structure, so users can ask for help without leaving the workspace."
        >
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusPill tone="accent">AI-guided help</StatusPill>
            <StatusPill>Human-in-the-loop</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={themeClassNames.softPanel}>
              <p className={themeClassNames.text.bodyStrong}>Plain language</p>
              <p className={cx("mt-2", themeClassNames.text.body)}>
                Explain medication steps without jargon.
              </p>
            </div>
            <div className={themeClassNames.softPanel}>
              <p className={themeClassNames.text.bodyStrong}>Draft messages</p>
              <p className={cx("mt-2", themeClassNames.text.body)}>
                Prepare questions or follow-up notes faster.
              </p>
            </div>
            <div className={themeClassNames.softPanel}>
              <p className={themeClassNames.text.bodyStrong}>Keep context</p>
              <p className={cx("mt-2", themeClassNames.text.body)}>
                Return to tasks, reminders, or messages from the same shell.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Suggested ask"
          title="Good first prompt"
          description={patientJourney.aiInsights[0]?.summary ?? "Review your next medication steps in plain language."}
        >
          <div className="space-y-3">
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.bodyStrong}>Try asking</p>
              <p className={cx("mt-2", themeClassNames.text.body)}>
                Summarize my next medication steps in plain language and tell me what I should do before my next follow-up.
              </p>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        eyebrow="Ask assistant"
        title="Role-aware support chat"
        description="This assistant stays focused on explanation, summaries, and drafts."
      >
        <SupportChat roleMode={context.role} />
      </SectionCard>
    </PostLoginShell>
  );
}
