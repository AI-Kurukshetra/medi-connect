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
          description="A patient profile scope is required before affordability and assistance options can be shown here."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      ) : (
        <ModuleOverview
          roleMode={context.role}
          eyebrow="Affordability support"
          title="Patient assistance and affordability panel"
          description="This route keeps financial-support options, enrollment progress, and next affordability steps inside the same care workspace."
          apiRoutes={[
            "/api/assistance/programs",
            "/api/assistance/enrollments",
            "/api/assistance/enrollments/:id/status",
          ]}
          points={[
            "Patients can understand which support options are still worth pursuing.",
            "Providers can review enrollment progress without leaving the shared shell.",
            "Status changes stay simple enough to explain during a short hackathon demo.",
          ]}
        />
      )}
    </PostLoginShell>
  );
}
