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

  const draftItems = drafts ?? [];

  return (
    <PostLoginShell currentPath="/messages">
      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow={`${context.role} messages`}
          title="Message drafts"
          description="Drafted outreach now sits inside the same workspace as tasks, support, and dashboard actions."
        >
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusPill tone="accent">Shared messaging route</StatusPill>
            <StatusPill>{draftItems.length} drafts</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Pending</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {draftItems.filter((item) => !item.approved).length}
              </p>
            </div>
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Approved</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {draftItems.filter((item) => item.approved).length}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Message lane"
          title="Role-aware outreach"
          description="Patients and providers stay on one route, but the shell keeps the right action context visible."
        >
          <div className="space-y-3">
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.body}>Patients can draft questions without leaving their care journey.</p>
            </div>
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.body}>Providers can review and approve follow-up without losing dashboard context.</p>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        eyebrow="Outreach cards"
        title="Current drafts"
        description="Author role, approval state, and message content all stay readable in one consistent card pattern."
      >
        <div className="space-y-3">
          {draftItems.map((draft) => (
            <div key={draft.id} className={themeClassNames.softPanel}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={themeClassNames.text.bodyStrong}>{draft.subject}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill>{draft.author_role}</StatusPill>
                  <StatusPill tone={draft.approved ? "success" : "warning"}>
                    {draft.approved ? "approved" : "pending"}
                  </StatusPill>
                </div>
              </div>
              <p className={cx("mt-2", themeClassNames.text.body)}>{draft.body}</p>
            </div>
          ))}
          {draftItems.length === 0 ? (
            <p className={themeClassNames.text.body}>
              No message drafts yet. Create drafts with <code>/api/messages</code>.
            </p>
          ) : null}
        </div>
      </SectionCard>
    </PostLoginShell>
  );
}
