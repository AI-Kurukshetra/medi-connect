import type { Metadata } from "next";
import Link from "next/link";
import { appTheme } from "@/theme";

export const metadata: Metadata = {
  title: "Privacy Policy | MediConnect",
  description: "How MediConnect collects, uses, and protects your health and personal information.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "1. Information We Collect",
    body: [
      "Account information you provide during registration: name, email address, role (patient or provider), and password.",
      "Health-related information you enter in the portal: medication plans, care tasks, adherence check-ins, appointment details, and messages.",
      "Usage data automatically collected when you interact with the platform: page views, session duration, browser type, and IP address.",
      "Communications you send through in-app messaging or support channels.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "To provide, operate, and maintain your MediConnect portal experience.",
      "To personalize your care dashboard and surface relevant tasks, reminders, and AI-assisted guidance.",
      "To facilitate secure communication between patients and providers.",
      "To improve platform reliability, fix bugs, and develop new features.",
      "To send you important service notifications such as appointment reminders and security alerts.",
      "We do not sell your personal or health information to third parties.",
    ],
  },
  {
    title: "3. Data Sharing",
    body: [
      "With your authorized care team — providers assigned to your care can view your profile, tasks, and adherence data.",
      "With service providers who help us operate the platform (e.g., database hosting, authentication), under strict data processing agreements.",
      "When required by law, regulation, or valid legal process.",
      "We will never share your health information for advertising or marketing purposes.",
    ],
  },
  {
    title: "4. Data Security",
    body: [
      "All data is encrypted in transit using TLS 1.2 or higher.",
      "Data at rest is encrypted using AES-256.",
      "Authentication is managed via Supabase with row-level security policies enforced at the database level.",
      "Access tokens are short-lived and rotated on each session.",
      "We conduct regular security reviews and follow OWASP guidelines.",
    ],
  },
  {
    title: "5. Your Rights",
    body: [
      "Access: You may request a copy of the personal data we hold about you.",
      "Correction: You may update inaccurate or incomplete information through your account settings.",
      "Deletion: You may request deletion of your account and associated data. Certain records may be retained as required by law.",
      "Portability: You may request an export of your data in a machine-readable format.",
      "To exercise any of these rights, contact us at privacy@mediconnect.app.",
    ],
  },
  {
    title: "6. Cookies and Tracking",
    body: [
      "MediConnect uses essential session cookies required for authentication. These cannot be disabled without breaking core functionality.",
      "We do not use third-party advertising cookies or cross-site tracking technologies.",
      "Anonymous analytics may be collected to improve product performance.",
    ],
  },
  {
    title: "7. Children's Privacy",
    body: [
      "MediConnect is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors.",
      "If you believe a minor has created an account, please contact us immediately at privacy@mediconnect.app.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    body: [
      "We may update this Privacy Policy periodically. We will notify you of significant changes via email or an in-app notification.",
      "Your continued use of MediConnect after changes are published constitutes acceptance of the updated policy.",
      "The date at the top of this page reflects when this policy was last updated.",
    ],
  },
  {
    title: "9. Contact",
    body: [
      "For privacy-related questions or requests: privacy@mediconnect.app",
      "For general support: support@mediconnect.app",
      "Mailing address: MediConnect, Inc. — available upon request.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8faff]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-[#2f6cf0] transition">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {appTheme.brand.name}
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link
              href="/sign-in"
              className="rounded-lg bg-[#2f6cf0] px-3 py-1.5 text-white transition hover:brightness-110"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-[linear-gradient(135deg,#101a33,#1e3a7a)] px-6 py-14 text-center text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-300">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Privacy Policy</h1>
        <p className="mt-3 text-sm text-blue-200">Last updated: March 14, 2026</p>
        <p className="mt-4 mx-auto max-w-xl text-base text-blue-100 leading-7">
          MediConnect is built for patients and providers navigating specialty medication care. We take
          the privacy of your health information seriously.
        </p>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12 space-y-10">
        {sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)]">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-900">{section.title}</h2>
            <ul className="mt-4 space-y-3">
              {section.body.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4f86ff]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 text-center sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-400">© 2026 {appTheme.brand.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <Link href="/privacy" className="text-[#2f6cf0]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/support" className="hover:text-slate-900 transition">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
