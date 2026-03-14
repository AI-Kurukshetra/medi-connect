"use client";

import { FormEvent, useState, useTransition } from "react";
import { StatusPill } from "@/components/status-pill";
import { cx, themeClassNames } from "@/theme";

interface SupportChatProps {
  roleMode: "patient" | "provider";
}

export function SupportChat({ roleMode }: SupportChatProps) {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/support/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message,
              module: "support",
            }),
          });
          const data = (await response.json()) as {
            data?: { answer?: string };
            error?: string;
          };

          if (!response.ok) {
            setAnswer(data.error ?? "Support bot is unavailable right now.");
            return;
          }

          setAnswer(data.data?.answer ?? "No response");
        } catch {
          setAnswer("Support bot is unavailable right now. Please try again.");
        }
      })();
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <StatusPill tone="accent">AI support active</StatusPill>
        <StatusPill>Gemini</StatusPill>
        <StatusPill>{roleMode} mode</StatusPill>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className={themeClassNames.softPanel}>
          <p className={themeClassNames.text.bodyStrong}>What to ask here</p>
          <p className={cx("mt-2", themeClassNames.text.body)}>
            Ask about your next step, how to use a MediConnect screen, reminders, messages, or how to contact the care team.
          </p>
        </div>
        <div className={themeClassNames.softPanel}>
          <p className={themeClassNames.text.bodyStrong}>How the assistant behaves</p>
          <p className={cx("mt-2", themeClassNames.text.body)}>
            The assistant explains and drafts. It does not diagnose or make clinical decisions.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={cx(themeClassNames.input, "min-h-32")}
          placeholder="Ask support about your next step..."
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending}
            className={themeClassNames.primaryButtonCompact}
          >
            {isPending ? "Generating..." : "Ask assistant"}
          </button>
          <button
            type="button"
            onClick={() => setMessage("Summarize my next medication steps in plain language.")}
            className={themeClassNames.secondaryButtonCompact}
          >
            Use sample prompt
          </button>
        </div>
      </form>

      {answer ? (
        <div className={themeClassNames.darkPanel}>
          <p className={themeClassNames.text.onDarkLabel}>Assistant response</p>
          <p className={cx("mt-3", themeClassNames.text.onDarkBody)}>{answer}</p>
        </div>
      ) : null}
    </div>
  );
}
