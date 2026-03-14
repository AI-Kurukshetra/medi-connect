import type { Metadata } from "next";
import { PostLoginShell } from "@/components/post-login-shell";
import { RoleAwareEmptyState } from "@/components/role-aware-empty-state";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { requireAuthContext } from "@/lib/auth/server";
import { resolveScopedPatientProfileId } from "@/lib/data/role-scope";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { cx, themeClassNames } from "@/theme";

export const metadata: Metadata = {
  title: "Messages",
  alternates: { canonical: "/messages" },
};

export default async function MessagesPage() {
  const context = await requireAuthContext();
  const patientProfileId = await resolveScopedPatientProfileId(context);

  if (!patientProfileId) {
    return (
      <PostLoginShell currentPath="/messages">
        <RoleAwareEmptyState
          roleMode={context.role}
          title="Messages are not available yet"
          description="No scoped patient profile exists for drafts."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      </PostLoginShell>
    );
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: drafts } = await serviceClient
    .from("message_drafts")
    .select("id, author_role, subject, body, approved, updated_at")
    .eq("patient_profile_id", patientProfileId)
    .order("updated_at", { ascending: false });

  return (
    <PostLoginShell currentPath="/messages">
      <SectionCard
        eyebrow={`${context.role} mode`}
        title="Shared messages module"
        description="Drafting flows use one route with role-aware templates and approval constraints."
      >
        <div className="space-y-3">
          {(drafts ?? []).map((draft) => (
            <div key={draft.id} className={themeClassNames.subtlePanel}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={themeClassNames.text.bodyStrong}>{draft.subject}</p>
                <div className="flex items-center gap-2">
                  <StatusPill>{draft.author_role}</StatusPill>
                  <StatusPill tone={draft.approved ? "success" : "warning"}>
                    {draft.approved ? "approved" : "pending"}
                  </StatusPill>
                </div>
              </div>
              <p className={cx("mt-2", themeClassNames.text.body)}>{draft.body}</p>
            </div>
          ))}
          {(drafts ?? []).length === 0 ? (
            <p className={themeClassNames.text.body}>
              No message drafts yet. Create drafts with <code>/api/messages</code>.
            </p>
          ) : null}
        </div>
      </SectionCard>
    </PostLoginShell>
  );
}

