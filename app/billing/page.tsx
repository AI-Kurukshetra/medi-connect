import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { RoleAwareEmptyState } from "@/components/role-aware-empty-state";
import { requireAuthContext } from "@/lib/auth/server";
import { resolveScopedPatientProfileId } from "@/lib/data/role-scope";

export const metadata: Metadata = {
  title: "Billing and Payments",
  alternates: { canonical: "/billing" },
};

export default async function BillingPage() {
  const context = await requireAuthContext();
  const patientProfileId = await resolveScopedPatientProfileId(context);

  return (
    <PostLoginShell currentPath="/billing">
      {!patientProfileId ? (
        <RoleAwareEmptyState
          roleMode={context.role}
          title="No billing scope available"
          description="Billing and payment records require a scoped patient profile."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      ) : (
        <ModuleOverview
          roleMode={context.role}
          eyebrow="Revenue Layer"
          title="Invoices and Payment Reconciliation"
          description="Billing APIs provide draft-to-paid invoice lifecycle and payment reconciliation."
          apiRoutes={[
            "/api/billing/invoices",
            "/api/billing/payments",
            "/api/billing/payments/:id/reconcile",
          ]}
          points={[
            "Stripe-compatible mock provider references are generated in payment flow.",
            "Reconciliation path moves payments to reconciled status for accounting consistency.",
            "Role-based access protects patient and provider views on financial records.",
          ]}
        />
      )}
    </PostLoginShell>
  );
}

