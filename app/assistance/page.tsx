import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { RoleAwareEmptyState } from "@/components/role-aware-empty-state";
import { requireAuthContext } from "@/lib/auth/server";
import { resolveScopedPatientProfileId } from "@/lib/data/role-scope";

export const metadata: Metadata = {
  title: "Patient Assistance Programs",
  alternates: { canonical: "/assistance" },
};

export default async function AssistancePage() {
  const context = await requireAuthContext();
  const patientProfileId = await resolveScopedPatientProfileId(context);

  return (
    <PostLoginShell currentPath="/assistance">
      {!patientProfileId ? (
        <RoleAwareEmptyState
          roleMode={context.role}
          title="No assistance enrollment context"
          description="A patient profile scope is required before starting program enrollment flows."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      ) : (
        <ModuleOverview
          roleMode={context.role}
          eyebrow="Financial Support"
          title="Patient Assistance Program Enrollment"
          description="Program catalog and enrollment timelines are available through shared role-aware routes."
          apiRoutes={[
            "/api/assistance/programs",
            "/api/assistance/enrollments",
            "/api/assistance/enrollments/:id/status",
          ]}
          points={[
            "Eligibility snapshots are stored at enrollment time.",
            "Status workflow includes draft/submitted/approved/denied/expired.",
            "Provider can review assigned patient enrollments.",
          ]}
        />
      )}
    </PostLoginShell>
  );
}

