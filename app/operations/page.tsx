import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { requireAuthContext } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Operations",
  alternates: { canonical: "/operations" },
};

export default async function OperationsPage() {
  const context = await requireAuthContext();

  return (
    <PostLoginShell currentPath="/operations">
      <ModuleOverview
        roleMode={context.role}
        eyebrow="Medication journey ops"
        title="Inventory and shipment support"
        description="This screen frames delivery status and operational milestones as supporting context for the medication journey, not a separate back-office product."
        apiRoutes={[
          "/api/operations/inventory",
          "/api/operations/shipments",
          "/api/operations/shipments/:id/events",
        ]}
        points={[
          "Providers can quickly reference delivery context while reviewing the patient journey.",
          "Operational events stay understandable enough for a live demo narrative.",
          "The route supports the specialty medication story without expanding into enterprise sprawl.",
        ]}
      />
    </PostLoginShell>
  );
}
