import type { Metadata } from "next";
import { AddTaskButton } from "@/components/add-task-button";
import { PostLoginShell } from "@/components/post-login-shell";
import { requireAuthContext } from "@/lib/auth/server";
import { resolveScopedPatientProfileId } from "@/lib/data/role-scope";
import { patientJourney } from "@/lib/mock-data";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { CareTaskSource, CareTaskStatus } from "@/types/medi-connect";
import { cx } from "@/theme";

export const metadata: Metadata = {
  title: "Tasks",
  alternates: { canonical: "/tasks" },
};

type TaskRecord = {
  id: string;
  title: string;
  description: string;
  status: CareTaskStatus;
  due_label: string | null;
  source: CareTaskSource;
  updated_at: string;
};

type TaskPriority = "high" | "medium" | "low";

const statusOrder: Record<CareTaskStatus, number> = {
  current: 0,
  upcoming: 1,
  complete: 2,
};

const priorityMeta: Record<
  TaskPriority,
  {
    label: string;
    className: string;
  }
> = {
  high: {
    label: "High priority",
    className: "bg-red-50 text-red-500",
  },
  medium: {
    label: "Medium priority",
    className: "bg-blue-50 text-blue-500",
  },
  low: {
    label: "Low priority",
    className: "bg-slate-100 text-slate-500",
  },
};

const statusMeta: Record<
  CareTaskStatus,
  {
    label: string;
    className: string;
  }
> = {
  current: {
    label: "Pending",
    className: "bg-amber-50 text-amber-500",
  },
  upcoming: {
    label: "Pending",
    className: "bg-amber-50 text-amber-500",
  },
  complete: {
    label: "Done",
    className: "bg-emerald-50 text-emerald-500",
  },
};

function compareTasks(a: TaskRecord, b: TaskRecord) {
  const orderDelta = statusOrder[a.status] - statusOrder[b.status];
  if (orderDelta !== 0) return orderDelta;

  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
}

function getTaskPriority(task: TaskRecord): TaskPriority {
  if (task.status === "current") return "high";
  if (task.source === "manual") return "medium";
  return "low";
}

export default async function TasksPage() {
  const context = await requireAuthContext();
  const patientProfileId = await resolveScopedPatientProfileId(context);
  const fallbackTasks =
    context.role === "provider"
      ? [
          {
            id: "provider-task-symptom-review",
            title: "Review Maya Patel's symptom baseline",
            description: "AI flagged two responses that need provider sign-off before the next dose.",
            status: "current" as const,
            due_label: "Due today",
            source: "ai" as const,
            updated_at: "2026-03-14T10:15:00.000Z",
          },
          {
            id: "provider-task-reminder-approval",
            title: "Approve first-dose reminder window",
            description: "Patient selected Tuesday at 7:30 PM for prep and follow-up nudges.",
            status: "current" as const,
            due_label: "Before 5:00 PM",
            source: "manual" as const,
            updated_at: "2026-03-14T09:45:00.000Z",
          },
          {
            id: "provider-task-outreach",
            title: "Send follow-up after missed check-in",
            description: "A draft message is ready for approval in the provider review lane.",
            status: "upcoming" as const,
            due_label: "Tomorrow morning",
            source: "ai" as const,
            updated_at: "2026-03-13T17:20:00.000Z",
          },
          {
            id: "provider-task-refill",
            title: "Confirm refill readiness",
            description: "Inventory and reminder timing both need one final review before outreach.",
            status: "complete" as const,
            due_label: "Completed today",
            source: "manual" as const,
            updated_at: "2026-03-14T08:00:00.000Z",
          },
        ]
      : patientJourney.careTasks.map((task, index) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          due_label: task.dueLabel,
          source: task.source,
          updated_at: `2026-03-14T0${index + 8}:00:00.000Z`,
        }));
  let taskItems: TaskRecord[] = fallbackTasks;

  if (patientProfileId) {
    const serviceClient = getSupabaseServiceClient();
    const { data: tasks } = await serviceClient
      .from("care_tasks")
      .select("id, title, description, status, due_label, source, updated_at")
      .eq("patient_profile_id", patientProfileId)
      .order("updated_at", { ascending: false });

    const fetchedTasks = ((tasks ?? []) as TaskRecord[]).sort(compareTasks);
    if (fetchedTasks.length > 0) {
      taskItems = fetchedTasks;
    }
  }

  const completedTasks = taskItems.filter((task) => task.status === "complete");
  const openTasks = taskItems.filter((task) => task.status !== "complete");

  return (
    <PostLoginShell currentPath="/tasks">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-slate-900">
              {context.role === "provider" ? "Care Tasks" : "My Tasks"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and track your daily medical administrative duties.
            </p>
          </div>

          <AddTaskButton patientProfileId={patientProfileId} />
        </div>

        <div className="mt-7 flex gap-6 border-b border-slate-200">
          {[
            { label: "All Tasks", active: true },
            { label: "Open", active: false },
            { label: "Completed", active: false },
          ].map((tab) => (
            <div
              key={tab.label}
              className={cx(
                "border-b-2 pb-3 text-sm font-semibold",
                tab.active ? "border-[#356ae6] text-[#356ae6]" : "border-transparent text-slate-400",
              )}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {taskItems.map((task) => {
            const priority = priorityMeta[getTaskPriority(task)];
            const status = statusMeta[task.status];

            return (
              <article
                key={task.id}
                className="flex flex-col gap-4 rounded-[14px] border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.2)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === "complete"}
                    readOnly
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#356ae6] focus:ring-[#356ae6]"
                  />
                  <div className="min-w-0">
                    <p
                      className={cx(
                        "text-sm font-semibold text-slate-900",
                        task.status === "complete" && "text-slate-400 line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{task.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span
                    className={cx(
                      "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      priority.className,
                    )}
                  >
                    {priority.label}
                  </span>
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    {task.due_label ?? "No due date"}
                  </span>
                  <span
                    className={cx(
                      "inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {taskItems.length > 0 ? (
          <div className="mt-8 flex flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {taskItems.length} task{taskItems.length === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-300"
                disabled
              >
                Previous
              </button>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#356ae6] text-sm font-semibold text-white">
                1
              </span>
              <button
                type="button"
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-400"
                disabled={openTasks.length === 0 && completedTasks.length === 0}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </PostLoginShell>
  );
}
