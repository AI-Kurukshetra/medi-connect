import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { appTheme } from "@/theme";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to MediConnect to continue specialty medication onboarding, reminders, and provider follow-up.",
  alternates: {
    canonical: "/sign-in",
  },
  openGraph: {
    title: `Sign In | ${appTheme.brand.name}`,
    description:
      "Sign in to continue your MediConnect care coordination flow.",
    url: "/sign-in",
    siteName: appTheme.brand.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `Sign In | ${appTheme.brand.name}`,
    description: "Sign in to continue your MediConnect flow.",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <AuthForm mode="sign-in" />
    </AuthShell>
  );
}
