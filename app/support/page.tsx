import type { Metadata } from "next";
import { PostLoginShell } from "@/components/post-login-shell";
import { SectionCard } from "@/components/section-card";
import { SupportChat } from "@/components/support-chat";
import { requireAuthContext } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Support",
  alternates: { canonical: "/support" },
};

export default async function SupportPage() {
  const context = await requireAuthContext();

  return (
    <PostLoginShell currentPath="/support">
      <SectionCard
        eyebrow={`${context.role} mode`}
        title="Chat support"
        description="One support route for all roles with role-aware prompt behavior."
      >
        <SupportChat roleMode={context.role} />
      </SectionCard>
    </PostLoginShell>
  );
}

