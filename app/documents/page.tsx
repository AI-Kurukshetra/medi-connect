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
        eyebrow="Clinical Docs"
        title="Secure Document Management"
        description="Versioned document records with sharing controls and signed URL download contracts."
        apiRoutes={[
          "/api/documents",
          "/api/documents/:id",
          "/api/documents/:id/share",
        ]}
        points={[
          "Versioning support is built into the document model.",
          "Document share permissions include view/edit and expiry.",
          "All document mutations emit audit events for traceability.",
        ]}
      />
    </PostLoginShell>
  );
}

