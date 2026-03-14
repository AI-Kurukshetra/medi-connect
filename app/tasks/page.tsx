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

  const taskItems = tasks ?? [];
  const summary = {
    complete: taskItems.filter((task) => task.status === "complete").length,
    current: taskItems.filter((task) => task.status === "current").length,
    upcoming: taskItems.filter((task) => task.status === "upcoming").length,
  };

  return (
    <PostLoginShell currentPath="/tasks">
      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow={`${context.role} tasks`}
          title="Task board"
          description="This shared route now reads like a proper checklist workspace inside the dashboard shell."
        >
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusPill tone="accent">Shared route</StatusPill>
            <StatusPill>{taskItems.length} total tasks</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Complete</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>{summary.complete}</p>
            </div>
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Current</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>{summary.current}</p>
            </div>
            <div className={themeClassNames.metricTile}>
              <p className={themeClassNames.text.label}>Upcoming</p>
              <p className={cx("mt-2", themeClassNames.text.headingMetric)}>{summary.upcoming}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Why it matters"
          title="Tasks stay visible next to support and reminders"
          description="The new shell keeps this route connected to the rest of the care journey."
        >
          <div className="space-y-3">
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.body}>Patients can work through a calmer step-by-step list.</p>
            </div>
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.body}>Providers can review blockers without leaving the same workspace.</p>
            </div>
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.body}>Status, due labels, and source stay easy to scan.</p>
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        eyebrow="Open checklist"
        title="Task cards"
        description="Each item keeps its status and timing visible at a glance."
      >
        <div className="space-y-3">
          {taskItems.map((task) => (
            <div key={task.id} className={themeClassNames.softPanel}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={themeClassNames.text.bodyStrong}>{task.title}</p>
                <StatusPill tone={statusTone[task.status as keyof typeof statusTone]}>
                  {task.status}
                </StatusPill>
              </div>
              <p className={cx("mt-2", themeClassNames.text.body)}>{task.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={themeClassNames.chip}>{task.due_label ?? "No due label"}</span>
                <span className={themeClassNames.chip}>{task.source}</span>
              </div>
            </div>
          ))}
          {taskItems.length === 0 ? (
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
