"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { appTheme, cx, themeClassNames } from "@/theme";

type AuthMode = "sign-in" | "sign-up";
type AccountRole = "patient" | "provider";

const copy = {
  "sign-in": {
    eyebrow: "Step 2: Access your account",
    title: "Sign in to continue",
    description:
      "You already reviewed the platform. Now enter your account and return to the right care flow.",
    action: "Sign in",
    alternatePrompt: "Need a new account?",
    alternateHref: "/sign-up",
    alternateLabel: "Create one here",
    helper: "After sign in, users land on /dashboard and shared modules adapt by role.",
  },
  "sign-up": {
    eyebrow: "Step 2: Create your account",
    title: "Create your MediConnect access",
    description:
      "Choose your role and enter the minimum details needed to start using the platform.",
    action: "Create account",
    alternatePrompt: "Already created your account?",
    alternateHref: "/sign-in",
    alternateLabel: "Sign in here",
    helper:
      "Choose a role once, then use one shared post-login route map.",
  },
} as const;

const roleDescriptions = {
  patient: "For medication onboarding, reminders, and care-plan guidance.",
  provider: "For patient review, blocker tracking, and follow-up drafting.",
} as const;

const inputClassName = themeClassNames.input;

interface AuthFormProps {
  mode: AuthMode;
}

function formatAuthErrorMessage(mode: AuthMode, message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("email rate limit exceeded")) {
    return mode === "sign-up"
      ? "Confirmation emails are temporarily rate-limited. Use the confirmation email already sent, wait a bit, or disable email confirmations / add custom SMTP in Supabase for hackathon testing."
      : "Email delivery is temporarily rate-limited. If this account was just created, use the confirmation email already sent or adjust Supabase email settings for faster testing.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "This account still needs email confirmation. Open the confirmation email already sent, or disable email confirmations in Supabase while you test the hackathon flow.";
  }

  return message;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<AccountRole>("patient");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
            emailRedirectTo: redirectBase
              ? `${redirectBase}/sign-in`
              : undefined,
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
          message:
            "Account created. Check your email to confirm your MediConnect access.",
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
    startTransition(() => {
      void submitAuth();
    });
  };

  return (
    <div>
      <div className="mb-4 inline-flex items-center gap-3 rounded-[18px] border border-[var(--card-border)] bg-[var(--card-subtle)] px-3 py-2">
        <Image
          src="/logo.png"
          alt={`${appTheme.brand.name} logo`}
          width={36}
          height={36}
          className="h-9 w-9 rounded-lg object-cover"
          priority
        />
        <span className={themeClassNames.text.bodyStrong}>{appTheme.brand.name}</span>
      </div>
      <p className={themeClassNames.text.eyebrow}>{content.eyebrow}</p>
      <h2 className="theme-heading mt-3 text-3xl font-semibold tracking-[-0.04em]">
        {content.title}
      </h2>
      <p className={cx("mt-3 max-w-xl", themeClassNames.text.body)}>
        {content.description}
      </p>
      <div className={cx("mt-5", themeClassNames.authInfoCard)}>
        <p className={themeClassNames.text.body}>{content.helper}</p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {isSignUp ? (
          <label className="block">
            <span className={themeClassNames.text.formLabel}>Full name</span>
            <input
              className={inputClassName}
              type="text"
              name="fullName"
              autoComplete="name"
              placeholder="Maya Patel"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>
        ) : null}

        {isSignUp ? (
          <fieldset>
            <legend className={themeClassNames.text.formLabel}>
              Account type
            </legend>
            <div className="space-y-3">
              <div className={themeClassNames.segmented}>
                {(["patient", "provider"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    className={
                      role === option
                        ? themeClassNames.segmentedOptionActive
                        : themeClassNames.segmentedOption
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className={themeClassNames.authInfoCard}>
                <p className={themeClassNames.text.body}>
                  {roleDescriptions[role]}
                </p>
              </div>
            </div>
          </fieldset>
        ) : null}

        <div className="grid gap-5">
          <label className="block">
            <span className={themeClassNames.text.formLabel}>Email address</span>
            <input
              className={inputClassName}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="care@mediconnect.app"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block">
            <span className={themeClassNames.text.formLabel}>Password</span>
            <input
              className={inputClassName}
              type="password"
              name="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder="Minimum 8 characters"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        </div>

        {feedback ? (
          <div
            className={
              feedback.type === "error"
                ? themeClassNames.feedbackError
                : themeClassNames.feedbackSuccess
            }
            aria-live="polite"
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isPending}
            className={cx(themeClassNames.primaryButton, "w-full sm:w-auto sm:min-w-44")}
          >
            {isPending ? "Please wait..." : content.action}
          </button>
          <Link href="/" className={themeClassNames.text.link}>
            Back to platform overview
          </Link>
        </div>
      </form>

      <p className={cx("mt-6", themeClassNames.text.body)}>
        {content.alternatePrompt}{" "}
        <Link href={content.alternateHref} className={themeClassNames.text.link}>
          {content.alternateLabel}
        </Link>
      </p>
    </div>
  );
}
