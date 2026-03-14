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
        eyebrow="Operations Layer"
        title="Inventory and Shipment Tracking"
        description="Supply chain foundation tracks lot status, cold-chain signals, and delivery event timelines."
        apiRoutes={[
          "/api/operations/inventory",
          "/api/operations/shipments",
          "/api/operations/shipments/:id/events",
        ]}
        points={[
          "Inventory supports lot/location/cold-chain and availability states.",
          "Shipments support tracking milestones and delivery outcomes.",
          "Logistics adapter supports mock and live provider contracts.",
        ]}
      />
    </PostLoginShell>
  );
}

