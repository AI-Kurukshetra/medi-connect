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
  title: "Adherence",
  alternates: { canonical: "/adherence" },
};

const statusTone = {
  taken: "success",
  missed: "warning",
  upcoming: "neutral",
} as const;

export default async function AdherencePage() {
  const context = await requireAuthContext();
  const patientProfileId = await resolveScopedPatientProfileId(context);

  if (!patientProfileId) {
    return (
      <PostLoginShell currentPath="/adherence">
        <RoleAwareEmptyState
          roleMode={context.role}
          title="Adherence stream unavailable"
          description="No scoped patient profile is available for this route yet."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      </PostLoginShell>
    );
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: checkIns } = await serviceClient
    .from("adherence_check_ins")
    .select("id, scheduled_for, status, note, updated_at")
    .eq("patient_profile_id", patientProfileId)
    .order("scheduled_for", { ascending: false, nullsFirst: false });

  const items = checkIns ?? [];

  return (
    <PostLoginShell currentPath="/adherence">
      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow={`${context.role} adherence`}
          title="Adherence timeline"
          description="Dose tracking, notes, and status now sit inside the same dashboard shell as the rest of the care journey."
        >
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusPill tone="accent">Shared route</StatusPill>
            <StatusPill>{items.length} check-ins</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Taken</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {items.filter((item) => item.status === "taken").length}
              </p>
            </div>
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Missed</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {items.filter((item) => item.status === "missed").length}
              </p>
            </div>
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Upcoming</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {items.filter((item) => item.status === "upcoming").length}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="What changes"
          title="The page feels connected to the rest of the product"
          description="It is now easier to move from adherence events to reminders, support, or follow-up messages."
        >
          <div className="space-y-3">
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.body}>Providers can review adherence context while keeping outreach routes one click away.</p>
            </div>
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.body}>Patients can understand their timeline without losing sight of reminders and support.</p>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        eyebrow="Dose history"
        title="Check-in cards"
        description="Status, timestamp, and note stay readable inside one consistent card pattern."
      >
        <div className="space-y-3">
          {items.map((entry) => (
            <div key={entry.id} className={themeClassNames.softPanel}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={themeClassNames.text.bodyStrong}>
                  {entry.scheduled_for
                    ? new Date(entry.scheduled_for).toLocaleString()
                    : "Unscheduled"}
                </p>
                <StatusPill tone={statusTone[entry.status as keyof typeof statusTone]}>
                  {entry.status}
                </StatusPill>
              </div>
              <p className={cx("mt-2", themeClassNames.text.body)}>
                {entry.note || "No note"}
              </p>
            </div>
          ))}
          {items.length === 0 ? (
            <p className={themeClassNames.text.body}>
              No adherence records yet. Use <code>/api/adherence</code> to create the first record.
            </p>
          ) : null}
        </div>
      </SectionCard>
    </PostLoginShell>
  );
}
