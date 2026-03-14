import type { Metadata } from "next";
import { ModuleOverview } from "@/components/module-overview";
import { PostLoginShell } from "@/components/post-login-shell";
import { requireAuthContext } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Document Management",
  alternates: { canonical: "/documents" },
};

export default async function DocumentsPage() {
  const context = await requireAuthContext();

  return (
    <PostLoginShell currentPath="/documents">
      <ModuleOverview
        roleMode={context.role}
        eyebrow="Care documents"
        title="Document vault and shared materials"
        description="Education packets, shared files, and uploaded documents now sit inside the same workspace as reminders, messages, and support."
        apiRoutes={[
          "/api/documents",
          "/api/documents/:id",
          "/api/documents/:id/share",
        ]}
        points={[
          "Patients can find what they need without hunting through multiple screens.",
          "Providers can share updated materials while staying in the same shell.",
          "The UI frames document actions as part of care coordination, not file management clutter.",
        ]}
      />
    </PostLoginShell>
  );
}
