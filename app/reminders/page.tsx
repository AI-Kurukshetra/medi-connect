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

  if (!patientProfileId) {
    return (
      <PostLoginShell currentPath="/reminders">
        <RoleAwareEmptyState
          roleMode={context.role}
          title="Reminder stream unavailable"
          description={
            context.role === "provider"
              ? "No assigned patient reminders exist for this provider context yet."
              : "Your reminder stream is not initialized yet."
          }
          ctaHref="/tasks"
          ctaLabel="Open tasks"
        />
      </PostLoginShell>
    );
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: reminders } = await serviceClient
    .from("reminders")
    .select("id, title, send_at, window_label, channel, status")
    .eq("patient_profile_id", patientProfileId)
    .order("send_at", { ascending: true, nullsFirst: false });

  return (
    <PostLoginShell currentPath="/reminders">
      <SectionCard
        eyebrow={`${context.role} mode`}
        title="Shared reminders module"
        description="This route stays the same for both roles. Role-specific fields are controlled by the API."
      >
        <div className="space-y-3">
          {(reminders ?? []).map((reminder) => (
            <div key={reminder.id} className={themeClassNames.subtlePanel}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={themeClassNames.text.bodyStrong}>{reminder.title}</p>
                <StatusPill tone={statusTone[reminder.status as keyof typeof statusTone]}>
                  {reminder.status}
                </StatusPill>
              </div>
              <p className={cx("mt-2", themeClassNames.text.body)}>
                {reminder.window_label} · {reminder.channel}
              </p>
              <p className={cx("mt-2", themeClassNames.text.label)}>
                {reminder.send_at
                  ? new Date(reminder.send_at).toLocaleString()
                  : "No send time"}
              </p>
            </div>
          ))}
          {(reminders ?? []).length === 0 ? (
            <p className={themeClassNames.text.body}>
              No reminders exist yet. Create reminders via <code>/api/reminders</code>.
            </p>
          ) : null}
        </div>
      </SectionCard>
    </PostLoginShell>
  );
}

