import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { requireAuthContext } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Billing and Payments",
  alternates: { canonical: "/billing" },
};

export default async function BillingPage() {
  const context = await requireAuthContext();

  return (
    <PostLoginShell currentPath="/billing">
      <ModuleOverview
        roleMode={context.role}
        eyebrow="Coverage and payment"
        title="Billing snapshot and payment status"
        description="This page keeps invoice progress, payment activity, and reimbursement follow-up inside the same dashboard experience."
        apiRoutes={[
          "/api/billing/invoices",
          "/api/billing/payments",
          "/api/billing/payments/:id/reconcile",
        ]}
        points={[
          "Patients can understand payment state without leaving the care flow.",
          "Providers can review billing status alongside the rest of the care journey.",
          "The route stays lightweight enough for demo storytelling instead of finance complexity.",
        ]}
      />
    </PostLoginShell>
  );
}
