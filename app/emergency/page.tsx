import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { RoleAwareEmptyState } from "@/components/role-aware-empty-state";
import { requireAuthContext } from "@/lib/auth/server";
import { resolveScopedPatientProfileId } from "@/lib/data/role-scope";

export const metadata: Metadata = {
  title: "Emergency and Escalation",
  alternates: { canonical: "/emergency" },
};

export default async function EmergencyPage() {
  const context = await requireAuthContext();
  const patientProfileId = await resolveScopedPatientProfileId(context);

  return (
    <PostLoginShell currentPath="/emergency">
      {!patientProfileId ? (
        <RoleAwareEmptyState
          roleMode={context.role}
          title="No emergency scope available"
          description="Emergency contacts and incidents require a scoped patient profile."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      ) : (
        <ModuleOverview
          roleMode={context.role}
          eyebrow="Safety Controls"
          title="Emergency Contacts and Escalation Incidents"
          description="Severity-based escalation workflow with SLA markers and acknowledgements."
          apiRoutes={[
            "/api/emergency/contacts",
            "/api/emergency/incidents",
            "/api/emergency/incidents/:id/escalate",
          ]}
          points={[
            "Incident states: open -> acknowledged -> escalated -> closed.",
            "Support flow can automatically create high-severity incidents.",
            "Notification adapter supports escalation dispatch contracts.",
          ]}
        />
      )}
    </PostLoginShell>
  );
}

