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
        eyebrow="Advanced AI Baseline"
        title="Risk Scoring and Recommendation APIs"
        description="Non-autonomous AI risk endpoints provide explainable scores with required human approval."
        apiRoutes={[
          "/api/ai/risk/adverse-event",
          "/api/ai/risk/adherence",
          "/api/ai/recommendations",
          "/api/iot/devices",
          "/api/iot/events",
        ]}
        points={[
          "Predictions store score, level, explanation payload, and human-approval marker.",
          "IoT module currently provides schema + ingestion scaffolding without live devices.",
          "Clinical decisions remain human-controlled.",
        ]}
      />
    </PostLoginShell>
  );
}

