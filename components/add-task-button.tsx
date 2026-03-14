"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type AddTaskButtonProps = {
  patientProfileId?: string | null;
};

export function AddTaskButton({ patientProfileId }: AddTaskButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    const body: Record<string, unknown> = {
      title: data.title,
      description: data.description || "",
      status: data.status,
      dueLabel: data.dueLabel || null,
      source: "manual",
    };
    if (patientProfileId) body.patientProfileId = patientProfileId;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Failed to create task");
      }
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
          setTimeout(() => titleRef.current?.focus(), 50);
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] px-5 py-2.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_20px_34px_-20px_rgba(59,130,246,0.75)] transition hover:brightness-[1.04] active:scale-[0.98]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Add Task
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add new task"
        className={`fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-[0_32px_64px_-16px_rgba(15,23,42,0.28)] transition-all duration-200 ${open ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v10M3 8h10" stroke="#2f6cf0" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">New Task</h2>
              <p className="text-[11px] text-slate-400">Add to your care checklist</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Task title <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              id="task-title"
              name="title"
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Submit insurance form"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="task-desc" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Description
            </label>
            <textarea
              id="task-desc"
              name="description"
              rows={3}
              maxLength={300}
              placeholder="Optional notes or details…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Row: Status + Due label */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="task-status" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Priority
              </label>
              <select
                id="task-status"
                name="status"
                defaultValue="upcoming"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                <option value="current">High – Urgent</option>
                <option value="upcoming">Normal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="task-due" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Due date
              </label>
              <input
                id="task-due"
                name="dueLabel"
                type="text"
                maxLength={60}
                placeholder="e.g. Tomorrow, Mar 20"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(59,130,246,0.6)] transition hover:brightness-[1.04] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
