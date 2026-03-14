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
  const fallbackItems =
    context.role === "provider"
      ? [
          {
            id: "provider-adherence-1",
            scheduled_for: "2026-03-14T18:30:00Z",
            status: "missed" as const,
            note: "AI flagged one delayed check-in and recommended same-day outreach.",
            updated_at: "2026-03-14T18:45:00Z",
          },
          {
            id: "provider-adherence-2",
            scheduled_for: "2026-03-13T19:00:00Z",
            status: "taken" as const,
            note: "Patient completed onboarding steps after reminder timing was clarified.",
            updated_at: "2026-03-13T20:00:00Z",
          },
          {
            id: "provider-adherence-3",
            scheduled_for: "2026-03-17T10:00:00Z",
            status: "upcoming" as const,
            note: "Next provider review is scheduled after the first full week of therapy.",
            updated_at: "2026-03-14T09:00:00Z",
          },
        ]
      : patientJourney.adherence.map((item, index) => ({
          id: item.id,
          scheduled_for: `2026-03-${14 + index}T${index === 0 ? "20:00:00" : index === 1 ? "19:30:00" : "10:00:00"}Z`,
          status: item.status,
          note: item.note,
          updated_at: `2026-03-${14 + index}T12:00:00Z`,
        }));
  let items: Array<{
    id: string;
    scheduled_for: string | null;
    status: "taken" | "missed" | "upcoming";
    note: string;
    updated_at?: string;
  }> = fallbackItems;

  if (patientProfileId) {
    const serviceClient = getSupabaseServiceClient();
    const { data: checkIns } = await serviceClient
      .from("adherence_check_ins")
      .select("id, scheduled_for, status, note, updated_at")
      .eq("patient_profile_id", patientProfileId)
      .order("scheduled_for", { ascending: false, nullsFirst: false });

    if ((checkIns ?? []).length > 0) {
      items = checkIns ?? [];
    }
  }

  return (
    <PostLoginShell currentPath="/adherence">
      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow={`${context.role} adherence`}
          title="Adherence timeline"
          description={
            context.role === "provider"
              ? "Risk flags, patient notes, and follow-up timing stay visible in one provider review lane."
              : "Dose tracking, notes, and status now sit inside the same dashboard shell as the rest of the care journey."
          }
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
          title={
            context.role === "provider"
              ? "Provider follow-up stays close to the signal"
              : "The page feels connected to the rest of the product"
          }
          description={
            context.role === "provider"
              ? "You can review patient adherence context without losing access to reminders, drafts, or support."
              : "It is now easier to move from adherence events to reminders, support, or follow-up messages."
          }
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
