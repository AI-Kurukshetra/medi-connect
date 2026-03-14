import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { appTheme } from "@/theme";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a MediConnect account for patient-friendly specialty medication guidance and provider coordination.",
  alternates: {
    canonical: "/sign-up",
  },
  openGraph: {
    title: `Create Account | ${appTheme.brand.name}`,
    description:
      "Create your MediConnect account and start the right role-based care flow.",
    url: "/sign-up",
    siteName: appTheme.brand.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `Create Account | ${appTheme.brand.name}`,
    description:
      "Create your MediConnect account and start your care coordination journey.",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <AuthForm mode="sign-up" />
    </AuthShell>
  );
}
