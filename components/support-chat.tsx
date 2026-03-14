"use client";

import { FormEvent, useState, useTransition } from "react";
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
        setAnswer(data.data?.answer ?? data.error ?? "No response");
      })();
    });
  };

  return (
    <div className="space-y-4">
      <p className={themeClassNames.text.body}>
        Role-aware support assistant is active in <strong>{roleMode}</strong> mode.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={cx(themeClassNames.input, "min-h-28")}
          placeholder="Ask support about your next step..."
        />
        <button type="submit" disabled={isPending} className={themeClassNames.primaryButtonCompact}>
          {isPending ? "Generating..." : "Ask assistant"}
        </button>
      </form>
      {answer ? (
        <div className={themeClassNames.softPanel}>
          <p className={themeClassNames.text.body}>{answer}</p>
        </div>
      ) : null}
    </div>
  );
}
