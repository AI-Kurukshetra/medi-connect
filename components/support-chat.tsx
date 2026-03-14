"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/theme";

interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  timestamp: Date;
}

interface SupportChatProps {
  roleMode: "patient" | "provider";
}

const SUGGESTED_PROMPTS = [
  "What should I do before my next injection?",
  "How do I log my medication in the portal?",
  "Explain my current therapy status.",
  "How do I message my provider?",
  "What happens if I miss a dose?",
  "Where do I find my reminders?",
];

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Minimal markdown → React nodes: bold, italic, bullet lists, line breaks */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];

    // Bullet line
    const bulletMatch = /^[\*\-]\s+(.+)$/.exec(line);
    if (bulletMatch) {
      result.push(
        <div key={li} className="flex items-start gap-2 my-0.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
          <span>{inlineMarkdown(bulletMatch[1])}</span>
        </div>,
      );
      continue;
    }

    // Heading (### or ##)
    const headingMatch = /^#{1,3}\s+(.+)$/.exec(line);
    if (headingMatch) {
      result.push(
        <p key={li} className="font-semibold mt-2 mb-0.5">{inlineMarkdown(headingMatch[1])}</p>,
      );
      continue;
    }

    // Empty line → spacer
    if (line.trim() === "") {
      result.push(<br key={li} />);
      continue;
    }

    // Normal paragraph line
    result.push(<p key={li}>{inlineMarkdown(line)}</p>);
  }

  return result;
}

function inlineMarkdown(text: string): React.ReactNode[] {
  // Split on **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (/^\*[^*]+\*$/.test(part)) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

const INITIAL_MESSAGE = (roleMode: "patient" | "provider"): Message => ({
  id: "welcome",
  role: "assistant",
  content:
    roleMode === "provider"
      ? "Hi! I'm MediBot, your MediConnect support assistant. I can help with workflow questions, patient summaries, or how to navigate the portal. What do you need?"
      : "Hi! I'm MediBot, your MediConnect support assistant. I can help you understand your medication journey, tasks, reminders, and how to use the portal. What would you like to know?",
  timestamp: new Date(),
});

export function SupportChat({ roleMode }: SupportChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE(roleMode)]);
  const [isPending, setIsPending] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearChat() {
    setMessages([INITIAL_MESSAGE(roleMode)]);
    setInput("");
    setIsPending(false);
    if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
  }

  const THINKING_STEPS = [
    "Agent is thinking…",
    "Searching knowledge base…",
    "Reading your context…",
    "Composing a response…",
    "Almost ready…",
  ];

  useEffect(() => {
    if (isPending) {
      setThinkingStep(0);
      thinkingTimerRef.current = setInterval(() => {
        setThinkingStep((s) => (s + 1) % THINKING_STEPS.length);
      }, 1400);
    } else {
      if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
    }
    return () => {
      if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsPending(true);

    void (async () => {
      try {
        const response = await fetch("/api/support/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, module: "support" }),
        });
        const data = (await response.json()) as {
          data?: { answer?: string };
          error?: string;
        };

        const content = !response.ok
          ? (data.error ?? "Support bot is unavailable right now.")
          : (data.data?.answer ?? "I didn't get a response. Please try again.");

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: !response.ok ? "error" : "assistant",
            content,
            timestamp: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "error",
            content: "Support bot is unavailable right now. Please try again.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsPending(false);
      }
    })();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div
      className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_8px_32px_-12px_rgba(15,23,42,0.12)]"
      style={{ height: "620px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-[linear-gradient(135deg,#0f1f45,#1a3070)] px-5 py-4 shrink-0">
        {/* Bot avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
              fill="rgba(255,255,255,0.15)"
              stroke="white"
              strokeWidth="1.5"
            />
            <path d="M8 10h8M8 14h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white tracking-wide">MediBot</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <p className="text-[11px] text-blue-200">AI Assistant · Online</p>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearChat}
            title="Start new conversation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M8 16H3v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Suggested prompts — only shown before any user message */}
      {messages.length === 1 && (
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 shrink-0">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Suggested questions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={isPending}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#f8faff]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cx(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <div
              className={cx(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                msg.role === "user"
                  ? "bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] text-white"
                  : msg.role === "error"
                    ? "bg-red-100 text-red-600"
                    : "bg-[linear-gradient(135deg,#101a33,#1e3069)] text-white",
              )}
            >
              {msg.role === "user" ? "Me" : msg.role === "error" ? "!" : "AI"}
            </div>

            <div
              className={cx(
                "flex max-w-[75%] flex-col gap-1",
                msg.role === "user" ? "items-end" : "items-start",
              )}
            >
              <div
                className={cx(
                  "rounded-2xl px-4 py-3 text-sm leading-7",
                  msg.role === "user"
                    ? "rounded-tr-sm bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] text-white shadow-[0_4px_16px_-6px_rgba(59,130,246,0.5)]"
                    : msg.role === "error"
                      ? "rounded-tl-sm border border-red-200 bg-red-50 text-red-700"
                      : "rounded-tl-sm border border-slate-200 bg-white text-slate-800 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.1)]",
                )}
              >
                {renderMarkdown(msg.content)}
              </div>
              <span className="text-[10px] text-slate-400">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex gap-3">
            {/* Avatar with pulse ring */}
            <div className="relative mt-0.5 shrink-0">
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#101a33,#1e3069)] text-[11px] font-semibold text-white">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Thinking card */}
            <div className="rounded-2xl rounded-tl-sm border border-blue-100 bg-white px-4 py-3 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.1)] min-w-50">
              {/* Status label */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:180ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:360ms]" />
                </span>
                <span className="text-[11px] font-semibold text-blue-600 transition-all duration-500">
                  {THINKING_STEPS[thinkingStep]}
                </span>
              </div>
              {/* Shimmer lines */}
              <div className="space-y-2">
                <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-100" />
                <div className="h-2.5 w-[80%] animate-pulse rounded-full bg-slate-100 [animation-delay:200ms]" />
                <div className="h-2.5 w-[55%] animate-pulse rounded-full bg-slate-100 [animation-delay:400ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            rows={1}
            placeholder="Type your question… (Enter to send)"
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60 max-h-28 overflow-y-auto"
            style={{ lineHeight: "1.6" }}
          />
          <button
            type="submit"
            disabled={isPending || !input.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.65)] transition hover:brightness-110 disabled:opacity-50 disabled:shadow-none"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="currentColor" />
            </svg>
          </button>
        </form>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-slate-400">
            <rect x="5" y="11" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <p className="text-[10px] text-slate-400">Secured by MediConnect AI · Not a substitute for medical advice</p>
        </div>
      </div>
    </div>
  );
}
