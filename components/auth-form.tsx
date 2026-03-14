"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { patientJourney } from "@/lib/mock-data";
import { appTheme, cx } from "@/theme";

type AuthMode = "sign-in" | "sign-up";
type AccountRole = "patient" | "provider";

const copy = {
  "sign-in": {
    title: "Welcome back",
    description: "Access your specialty medications and care plan.",
    action: "Sign In",
    alternatePrompt: "Don't have an account?",
    alternateHref: "/sign-up",
    alternateLabel: "Sign up for MediConnect",
    helperLabel: "Remember me for 30 days",
  },
  "sign-up": {
    title: "Create your account",
    description: "Join MediConnect to manage your specialty care plan.",
    action: "Create Account",
    alternatePrompt: "Already have an account?",
    alternateHref: "/sign-in",
    alternateLabel: "Sign in",
    helperLabel: "I agree to the Terms of Service and Privacy Policy",
  },
} as const;

const roleDescriptions = {
  patient: {
    label: "Patient",
    detail: "Medication onboarding, reminders, and next-step clarity.",
    preview:
      patientJourney.aiInsights[0]?.summary ??
      "Review your next medication steps in plain language.",
  },
  provider: {
    label: "Provider",
    detail: "Patient review, blockers, and follow-up drafting.",
    preview: patientJourney.providerSummary.recommendedAction,
  },
} as const;

interface AuthFormProps {
  mode: AuthMode;
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M3 7.5 12 13l9-5.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5" y="10" width="14" height="10" rx="2.5" />
      <path d="M12 14.5v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="m3 3 18 18" strokeLinecap="round" />
      <path
        d="M10.6 10.7a2 2 0 0 0 2.7 2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 5.3A10.9 10.9 0 0 1 12 5c4.7 0 8.7 2.9 10 7a10.6 10.6 0 0 1-4.1 5.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 6.3A10.7 10.7 0 0 0 2 12c1.3 4.1 5.3 7 10 7 1 0 2-.1 2.9-.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path
        d="M2 12c1.5-4.2 5.4-7 10-7s8.5 2.8 10 7c-1.5 4.2-5.4 7-10 7S3.5 16.2 2 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AppIcon() {
  return (
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(51,102,255,0.1)] text-[var(--brand)]">
      <Image
        src="/logo.png"
        alt={`${appTheme.brand.name} logo`}
        width={28}
        height={28}
        className="h-7 w-7 rounded-[10px] object-cover"
        priority
      />
    </div>
  );
}

function formatAuthErrorMessage(mode: AuthMode, message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("email rate limit exceeded")) {
    return mode === "sign-up"
      ? "Confirmation emails are temporarily rate-limited. Use the confirmation email already sent, wait a bit, or disable email confirmations in Supabase for testing."
      : "Email delivery is temporarily rate-limited. If this account was just created, use the confirmation email already sent or adjust Supabase email settings for testing.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "This account still needs email confirmation. Open the confirmation email already sent, or disable email confirmations in Supabase while you test.";
  }

  return message;
}

function Field({
  label,
  icon,
  children,
  action,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--foreground-strong)]">{label}</span>
        {action}
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--muted)]">
          {icon}
        </div>
        {children}
      </div>
    </label>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<AccountRole>("patient");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const isSignUp = mode === "sign-up";
  const content = copy[mode];

  const submitAuth = async () => {
    try {
      const supabase = getSupabaseBrowserClient();

      if (isSignUp) {
        const redirectBase =
          typeof window === "undefined"
            ? process.env.NEXT_PUBLIC_APP_URL
            : window.location.origin;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectBase ? `${redirectBase}/sign-in` : undefined,
            data: {
              full_name: fullName.trim(),
              role,
            },
          },
        });

        if (error) {
          setFeedback({
            type: "error",
            message: formatAuthErrorMessage(mode, error.message),
          });
          return;
        }

        if (data.session) {
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: data.session.access_token }),
          });
          router.replace("/dashboard");
          router.refresh();
          return;
        }

        setFeedback({
          type: "success",
          message: "Account created. Check your email to confirm your MediConnect access.",
        });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setFeedback({
          type: "error",
          message: formatAuthErrorMessage(mode, error.message),
        });
        return;
      }

      if (data.session?.access_token) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: data.session.access_token }),
        });
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while talking to Supabase.";

      setFeedback({ type: "error", message });
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (isSignUp && !acceptTerms) {
      setFeedback({
        type: "error",
        message: "Please accept the terms before creating your account.",
      });
      return;
    }

    startTransition(() => {
      void submitAuth();
    });
  };

  return (
    <div className="rounded-[24px] border border-[rgba(51,102,255,0.08)] bg-white px-7 py-8 shadow-[0_28px_60px_-42px_rgba(35,56,128,0.28)] sm:px-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <AppIcon />
        <h1 className="text-[30px] font-semibold tracking-[-0.05em] text-[var(--foreground-strong)]">
          {content.title}
        </h1>
        <p className="mt-2 max-w-[24rem] text-sm leading-6 text-[var(--muted)]">
          {content.description}
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {isSignUp ? (
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--foreground-strong)]">I am a...</p>
            <div className="rounded-[14px] bg-[rgba(15,23,42,0.05)] p-1">
              <div className="grid grid-cols-2 gap-1">
                {(["patient", "provider"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    className={cx(
                      "rounded-[10px] px-4 py-2.5 text-sm font-medium transition",
                      role === option
                        ? "bg-white text-[var(--foreground-strong)] shadow-[0_6px_16px_-12px_rgba(15,23,42,0.28)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground-strong)]",
                    )}
                  >
                    {roleDescriptions[option].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-[14px] border border-[rgba(51,102,255,0.08)] bg-[rgba(247,249,255,0.9)] p-4">
              <p className="text-sm font-semibold text-[var(--foreground-strong)]">
                {roleDescriptions[role].detail}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {roleDescriptions[role].preview}
              </p>
            </div>
          </div>
        ) : null}

        {isSignUp ? (
          <Field label="Full Name" icon={<UserIcon />}>
            <input
              className="block w-full rounded-[14px] border border-[rgba(51,102,255,0.12)] bg-[rgba(248,250,255,0.92)] py-3 pl-11 pr-4 text-sm text-[var(--foreground-strong)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-[rgba(95,131,255,0.12)]"
              type="text"
              name="fullName"
              autoComplete="name"
              placeholder="John Doe"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </Field>
        ) : null}

        <Field label="Email Address" icon={<MailIcon />}>
          <input
            className="block w-full rounded-[14px] border border-[rgba(51,102,255,0.12)] bg-[rgba(248,250,255,0.92)] py-3 pl-11 pr-4 text-sm text-[var(--foreground-strong)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-[rgba(95,131,255,0.12)]"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="name@company.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>

        <Field
          label="Password"
          icon={<LockIcon />}
          action={
            !isSignUp ? (
              <span className="text-xs font-semibold text-[var(--brand)]">Secure login</span>
            ) : null
          }
        >
          <input
            className="block w-full rounded-[14px] border border-[rgba(51,102,255,0.12)] bg-[rgba(248,250,255,0.92)] py-3 pl-11 pr-12 text-sm text-[var(--foreground-strong)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-[rgba(95,131,255,0.12)]"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder="••••••••"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--muted)] transition hover:text-[var(--foreground-strong)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon hidden={showPassword} />
          </button>
        </Field>

        <label className="flex items-start gap-3 pt-1">
          <input
            className="mt-1 h-4 w-4 rounded border-[rgba(51,102,255,0.24)] text-[var(--brand)] focus:ring-[var(--brand)]"
            type="checkbox"
            checked={isSignUp ? acceptTerms : rememberMe}
            onChange={(event) =>
              isSignUp ? setAcceptTerms(event.target.checked) : setRememberMe(event.target.checked)
            }
          />
          <span className="text-sm leading-6 text-[var(--muted)]">
            {isSignUp ? (
              <>
                I agree to the{" "}
                <span className="font-semibold text-[var(--brand)]">Terms of Service</span> and{" "}
                <span className="font-semibold text-[var(--brand)]">Privacy Policy</span>
              </>
            ) : (
              content.helperLabel
            )}
          </span>
        </label>

        {feedback ? (
          <div
            className={cx(
              "rounded-[14px] border px-4 py-3 text-sm leading-6",
              feedback.type === "error"
                ? "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]"
                : "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]",
            )}
            aria-live="polite"
          >
            {feedback.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-[var(--brand-contrast)] shadow-[0_18px_30px_-20px_rgba(41,84,235,0.6)] transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isPending ? "Please wait..." : content.action}</span>
          <ArrowIcon />
        </button>
      </form>

      <div className="mt-8 border-t border-[rgba(15,23,42,0.06)] pt-6 text-center">
        <p className="text-sm text-[var(--muted)]">
          {content.alternatePrompt}{" "}
          <Link href={content.alternateHref} className="font-semibold text-[var(--brand)] hover:underline">
            {content.alternateLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
