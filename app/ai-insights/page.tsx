import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { requireAuthContext } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "AI Insights",
  alternates: { canonical: "/ai-insights" },
};

export default async function AiInsightsPage() {
  const context = await requireAuthContext();

  return (
    <PostLoginShell currentPath="/ai-insights">
      <ModuleOverview
        roleMode={context.role}
        eyebrow="AI guidance layer"
        title="AI insights and follow-up suggestions"
        description="This screen turns adherence signals and patient context into explainable summaries, highlighted risks, and human-reviewed next-step suggestions."
        apiRoutes={[
          "/api/ai/risk/adverse-event",
          "/api/ai/risk/adherence",
          "/api/ai/recommendations",
          "/api/iot/devices",
          "/api/iot/events",
        ]}
        points={[
          "Summaries surface what changed without forcing the user to read raw records.",
          "Risk flags stay explainable so providers can review them before acting.",
          "Recommendations help draft the next move, but people still make the final decision.",
        ]}
      />
    </PostLoginShell>
  );
}
