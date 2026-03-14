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
  title: "Tasks",
  alternates: { canonical: "/tasks" },
};

const statusTone = {
  complete: "success",
  current: "accent",
  upcoming: "neutral",
} as const;

export default async function TasksPage() {
  const context = await requireAuthContext();
  const patientProfileId = await resolveScopedPatientProfileId(context);

  if (!patientProfileId) {
    return (
      <PostLoginShell currentPath="/tasks">
        <RoleAwareEmptyState
          roleMode={context.role}
          title="Tasks are not available yet"
          description="No scoped patient profile exists for this session. Link a patient profile first."
          ctaHref="/dashboard"
          ctaLabel="Back to dashboard"
        />
      </PostLoginShell>
    );
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: tasks } = await serviceClient
    .from("care_tasks")
    .select("id, title, description, status, due_label, source, updated_at")
    .eq("patient_profile_id", patientProfileId)
    .order("updated_at", { ascending: false });

  return (
    <PostLoginShell currentPath="/tasks">
      <SectionCard
        eyebrow={`${context.role} mode`}
        title="Shared tasks module"
        description="Same route for both roles. Editable fields are role-constrained by API guards."
      >
        <div className="space-y-3">
          {(tasks ?? []).map((task) => (
            <div key={task.id} className={themeClassNames.subtlePanel}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={themeClassNames.text.bodyStrong}>{task.title}</p>
                <StatusPill tone={statusTone[task.status as keyof typeof statusTone]}>
                  {task.status}
                </StatusPill>
              </div>
              <p className={cx("mt-2", themeClassNames.text.body)}>{task.description}</p>
              <p className={cx("mt-3", themeClassNames.text.label)}>
                {task.due_label ?? "No due label"} · {task.source}
              </p>
            </div>
          ))}
          {(tasks ?? []).length === 0 ? (
            <RoleAwareEmptyState
              roleMode={context.role}
              title="No tasks yet"
              description={
                context.role === "provider"
                  ? "No provider-scoped tasks exist yet. Create one through /api/tasks."
                  : "You do not have active care tasks yet. A provider can add one, or you can create manually."
              }
              ctaHref="/dashboard"
              ctaLabel="Back to dashboard"
            />
          ) : null}
        </div>
      </SectionCard>
    </PostLoginShell>
  );
}

