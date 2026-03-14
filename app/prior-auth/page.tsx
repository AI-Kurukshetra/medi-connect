import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { RoleAwareEmptyState } from "@/components/role-aware-empty-state";
import { requireAuthContext } from "@/lib/auth/server";
import { resolveScopedPatientProfileId } from "@/lib/data/role-scope";

export const metadata: Metadata = {
  title: "Prior Authorization",
  alternates: { canonical: "/prior-auth" },
};

export default async function PriorAuthPage() {
  const context = await requireAuthContext();
  const patientProfileId = await resolveScopedPatientProfileId(context);

  return (
    <PostLoginShell currentPath="/prior-auth">
      {!patientProfileId ? (
        <RoleAwareEmptyState
          roleMode={context.role}
          title="Prior authorization queue is empty"
          description="No scoped patient profile is available for insurance verification and prior authorization workflows."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      ) : (
        <ModuleOverview
          roleMode={context.role}
          eyebrow="Clinical + Safety"
          title="Insurance Verification and Prior Authorization"
          description="Unified role-aware workflows for verification, prior-auth submissions, and status events."
          apiRoutes={[
            "/api/insurance/verifications",
            "/api/prior-auth/requests",
            "/api/prior-auth/requests/:id/events",
          ]}
          points={[
            "Status workflow: draft -> submitted -> payer-review -> approved/denied/appeal.",
            "Patients can submit and view their own requests.",
            "Providers can manage assigned patient requests and transitions.",
          ]}
        />
      )}
    </PostLoginShell>
  );
}

