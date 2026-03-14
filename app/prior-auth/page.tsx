import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { requireAuthContext } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Prior Authorization",
  alternates: { canonical: "/prior-auth" },
};

export default async function PriorAuthPage() {
  const context = await requireAuthContext();

  return (
    <PostLoginShell currentPath="/prior-auth">
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
    </PostLoginShell>
  );
}
