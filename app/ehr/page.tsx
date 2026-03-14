import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { requireAuthContext } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "EHR and FHIR Integration",
  alternates: { canonical: "/ehr" },
};

export default async function EhrPage() {
  const context = await requireAuthContext();

  return (
    <PostLoginShell currentPath="/ehr">
      <ModuleOverview
        roleMode={context.role}
        eyebrow="Clinical Interop"
        title="EHR and FHIR Hybrid Integration"
        description="FHIR R4 resource sync and custom JSON workflows are unified behind role-aware APIs."
        apiRoutes={[
          "/api/ehr/links",
          "/api/ehr/sync-jobs",
          "/api/ehr/patient-summary",
        ]}
        points={[
          "FHIR R4 resources supported: Patient, Practitioner, MedicationRequest, CarePlan, Observation, DocumentReference.",
          "Idempotent sync-job model with queued/running/succeeded/failed states.",
          "Mock-first integration adapters with live connector contract compatibility.",
        ]}
      />
    </PostLoginShell>
  );
}

