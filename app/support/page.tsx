import type { Metadata } from "next";
import { PostLoginShell } from "@/components/post-login-shell";
import { SupportChat } from "@/components/support-chat";
import { requireAuthContext } from "@/lib/auth/server";
import { FaqPanel } from "@/components/faq-panel";

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
            How can we help?
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse our frequently asked questions or use our AI assistant for immediate help.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
          <FaqPanel />
          <div className="lg:sticky lg:top-6">
            <SupportChat roleMode={context.role} />
          </div>
        </div>
      </section>
    </PostLoginShell>
  );
}
