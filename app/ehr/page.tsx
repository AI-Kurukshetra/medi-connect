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
        eyebrow="Connected records"
        title="EHR summary and sync view"
        description="This page summarizes connected patient records and care-plan sync activity without making the product feel like a complex interoperability tool."
        apiRoutes={[
          "/api/ehr/links",
          "/api/ehr/sync-jobs",
          "/api/ehr/patient-summary",
        ]}
        points={[
          "Providers can reference connected clinical context while staying in the care workspace.",
          "The UI keeps EHR data framed as supporting context, not the main product story.",
          "Mock-first connectors still map cleanly to live integrations later if needed.",
        ]}
      />
    </PostLoginShell>
  );
}
