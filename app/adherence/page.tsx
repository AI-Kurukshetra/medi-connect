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

  return (
    <PostLoginShell currentPath="/adherence">
      <SectionCard
        eyebrow={`${context.role} mode`}
        title="Shared adherence module"
        description="Both roles use this route. Role-specific mutation rules are enforced on /api/adherence."
      >
        <div className="space-y-3">
          {(checkIns ?? []).map((entry) => (
            <div key={entry.id} className={themeClassNames.subtlePanel}>
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
          {(checkIns ?? []).length === 0 ? (
            <p className={themeClassNames.text.body}>
              No adherence records yet. Use <code>/api/adherence</code> to create the first record.
            </p>
          ) : null}
        </div>
      </SectionCard>
    </PostLoginShell>
  );
}

