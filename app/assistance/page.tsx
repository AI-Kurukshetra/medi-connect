import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { requireAuthContext } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Patient Assistance Programs",
  alternates: { canonical: "/assistance" },
};

export default async function AssistancePage() {
  const context = await requireAuthContext();

  return (
    <PostLoginShell currentPath="/assistance">
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
    </PostLoginShell>
  );
}
