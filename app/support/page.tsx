import type { Metadata } from "next";
import { PostLoginShell } from "@/components/post-login-shell";
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
      <section>
        <div className="mb-6">
          <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-slate-900">
            Support
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ask the AI assistant anything about your care journey, the portal, or your next steps.
          </p>
        </div>
        <SupportChat roleMode={context.role} />
      </section>
    </PostLoginShell>
  );
}
