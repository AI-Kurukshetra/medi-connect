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
          description="No scoped patient profile is available yet for coverage review and authorization follow-up."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      ) : (
        <ModuleOverview
          roleMode={context.role}
          eyebrow="Coverage review"
          title="Prior authorization and coverage status"
          description="This route keeps verification status, submission progress, and follow-up events visible in the same shared workspace."
          apiRoutes={[
            "/api/insurance/verifications",
            "/api/prior-auth/requests",
            "/api/prior-auth/requests/:id/events",
          ]}
          points={[
            "Patients can understand where coverage review stands without reading payer jargon.",
            "Providers can manage blockers and status transitions from the same shell.",
            "The UI keeps the flow demoable while still showing a believable specialty-care step.",
          ]}
        />
      )}
    </PostLoginShell>
  );
}
