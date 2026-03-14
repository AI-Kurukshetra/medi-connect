import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { requireAuthContext } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Emergency and Escalation",
  alternates: { canonical: "/emergency" },
};

export default async function EmergencyPage() {
  const context = await requireAuthContext();

  return (
    <PostLoginShell currentPath="/emergency">
      <ModuleOverview
        roleMode={context.role}
        eyebrow="Urgent escalation"
        title="Emergency contacts and safety escalation"
        description="This route keeps urgent contacts, incident history, and escalation actions available without breaking the rest of the care workflow."
        apiRoutes={[
          "/api/emergency/contacts",
          "/api/emergency/incidents",
          "/api/emergency/incidents/:id/escalate",
        ]}
        points={[
          "Patients can understand where urgent help lives inside the product.",
          "Providers can escalate faster while staying inside the same dashboard shell.",
          "The experience highlights urgency without turning the UI into an operations console.",
        ]}
      />
    </PostLoginShell>
  );
}
