import type { Metadata } from "next";
import { PostLoginShell } from "@/components/post-login-shell";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { requireAuthContext } from "@/lib/auth/server";
import { resolveScopedPatientProfileId } from "@/lib/data/role-scope";
import { patientJourney } from "@/lib/mock-data";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { cx, themeClassNames } from "@/theme";

export const metadata: Metadata = {
  title: "Messages",
  alternates: { canonical: "/messages" },
};

export default async function MessagesPage() {
  const context = await requireAuthContext();
  const patientProfileId = await resolveScopedPatientProfileId(context);
  const fallbackDrafts =
    context.role === "provider"
      ? [
          {
            id: "provider-draft-baseline",
            author_role: "provider" as const,
            subject: "Please complete your symptom baseline tonight",
            body: "Hi Maya, I reviewed your setup progress. Please complete the symptom baseline tonight so we can confirm your dose plan before tomorrow.",
            approved: false,
            updated_at: "2026-03-14T09:00:00Z",
          },
          {
            id: "provider-draft-check-in",
            author_role: "provider" as const,
            subject: "Quick check-in after your first Humira dose",
            body: "Thanks for staying on track. If you notice redness that lasts longer than 48 hours or anything feels unusual, send us a message and we will review it quickly.",
            approved: true,
            updated_at: "2026-03-13T15:30:00Z",
          },
        ]
      : [
          {
            id: patientJourney.messageDraft.id,
            author_role: patientJourney.messageDraft.authorRole,
            subject: patientJourney.messageDraft.subject,
            body: patientJourney.messageDraft.body,
            approved: patientJourney.messageDraft.approved,
            updated_at: "2026-03-14T09:00:00Z",
          },
          {
            id: "draft-provider-follow-up",
            author_role: "provider" as const,
            subject: "Follow-up after your first Humira dose",
            body: "Hi Maya, I reviewed your checklist progress. Please submit the symptom baseline tonight and message us if you notice anything unexpected after the dose.",
            approved: true,
            updated_at: "2026-03-13T15:30:00Z",
          },
        ];
  let draftItems: Array<{
    id: string;
    author_role: "patient" | "provider";
    subject: string;
    body: string;
    approved: boolean;
    updated_at: string;
  }> = fallbackDrafts;

  if (patientProfileId) {
    const serviceClient = getSupabaseServiceClient();
    const { data: drafts } = await serviceClient
      .from("message_drafts")
      .select("id, author_role, subject, body, approved, updated_at")
      .eq("patient_profile_id", patientProfileId)
      .order("updated_at", { ascending: false });

    if ((drafts ?? []).length > 0) {
      draftItems = drafts ?? [];
    }
  }

  return (
    <PostLoginShell currentPath="/messages">
      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow={`${context.role} messages`}
          title="Message drafts"
          description={
            context.role === "provider"
              ? "Provider outreach, approval state, and follow-up timing now sit in the same workspace as tasks and reminders."
              : "Drafted outreach now sits inside the same workspace as tasks, support, and dashboard actions."
          }
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
