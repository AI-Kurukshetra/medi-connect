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
  title: "Reminders",
  alternates: { canonical: "/reminders" },
};

const statusTone = {
  scheduled: "accent",
  sent: "success",
  cancelled: "warning",
} as const;

export default async function RemindersPage() {
  const context = await requireAuthContext();
  const patientProfileId = await resolveScopedPatientProfileId(context);
  const fallbackItems =
    context.role === "provider"
      ? [
          {
            id: "provider-reminder-1",
            title: "Baseline follow-up nudge",
            send_at: "2026-03-16T13:30:00Z",
            window_label: "Monday at 7:00 PM",
            channel: "SMS + in-app",
            status: "scheduled" as const,
          },
          {
            id: "provider-reminder-2",
            title: "First dose check-in",
            send_at: "2026-03-17T19:00:00Z",
            window_label: "Tuesday at 7:30 PM",
            channel: "In-app",
            status: "scheduled" as const,
          },
          {
            id: "provider-reminder-3",
            title: "Refill planning reminder",
            send_at: "2026-03-14T08:30:00Z",
            window_label: "Sent this morning",
            channel: "Email",
            status: "sent" as const,
          },
        ]
      : patientJourney.reminders.map((reminder, index) => ({
          id: reminder.id,
          title: reminder.title,
          send_at: `2026-03-${15 + index}T${index === 0 ? "19:00:00" : index === 1 ? "19:30:00" : "09:00:00"}Z`,
          window_label: reminder.window,
          channel: reminder.channel,
          status: (index === 2 ? "sent" : "scheduled") as "scheduled" | "sent" | "cancelled",
        }));
  let reminderItems: Array<{
    id: string;
    title: string;
    send_at: string | null;
    window_label: string;
    channel: string;
    status: "scheduled" | "sent" | "cancelled";
  }> = fallbackItems;

  if (patientProfileId) {
    const serviceClient = getSupabaseServiceClient();
    const { data: reminders } = await serviceClient
      .from("reminders")
      .select("id, title, send_at, window_label, channel, status")
      .eq("patient_profile_id", patientProfileId)
      .order("send_at", { ascending: true, nullsFirst: false });

    if ((reminders ?? []).length > 0) {
      reminderItems = reminders ?? [];
    }
  }

  return (
    <PostLoginShell currentPath="/reminders">
      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow={`${context.role} reminders`}
          title="Reminder center"
          description={
            context.role === "provider"
              ? "Provider reminder timing, channels, and outreach coverage stay visible in one review surface."
              : "This route now feels like part of the dashboard, not an isolated list."
          }
        >
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusPill tone="accent">Notification timeline</StatusPill>
            <StatusPill>{reminderItems.length} scheduled items</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Scheduled</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {reminderItems.filter((item) => item.status === "scheduled").length}
              </p>
            </div>
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Sent</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {reminderItems.filter((item) => item.status === "sent").length}
              </p>
            </div>
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Cancelled</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>
                {reminderItems.filter((item) => item.status === "cancelled").length}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="What users get"
          title={
            context.role === "provider"
              ? "Patient outreach timing is easier to scan"
              : "Reminder timing is easier to scan"
          }
          description="Window labels, channels, and send times sit on stronger cards with clearer hierarchy."
        >
          <div className="space-y-3">
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.body}>Patients can see when messages arrive and through which channel.</p>
            </div>
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.body}>Providers can keep reminder context visible while reviewing adherence and tasks.</p>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        eyebrow="Reminder cards"
        title="Scheduled messages"
        description="Each reminder keeps timing, delivery, and current status in one visual block."
      >
        <div className="space-y-3">
          {reminderItems.map((reminder) => (
            <div key={reminder.id} className={themeClassNames.softPanel}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={themeClassNames.text.bodyStrong}>{reminder.title}</p>
                <StatusPill tone={statusTone[reminder.status as keyof typeof statusTone]}>
                  {reminder.status}
                </StatusPill>
              </div>
              <p className={cx("mt-2", themeClassNames.text.body)}>
                {reminder.window_label} · {reminder.channel}
              </p>
              <p className={cx("mt-3", themeClassNames.text.label)}>
                {reminder.send_at
                  ? new Date(reminder.send_at).toLocaleString()
                  : "No send time"}
              </p>
            </div>
          ))}
          {reminderItems.length === 0 ? (
            <p className={themeClassNames.text.body}>
              No reminders exist yet. Create reminders via <code>/api/reminders</code>.
            </p>
          ) : null}
        </div>
      </SectionCard>
    </PostLoginShell>
  );
}
