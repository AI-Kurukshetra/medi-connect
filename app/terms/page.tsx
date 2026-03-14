import type { Metadata } from "next";
import Link from "next/link";
import { appTheme } from "@/theme";

export const metadata: Metadata = {
  title: "Terms of Service | MediConnect",
  description: "Terms governing your use of the MediConnect patient and provider portal.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By accessing or using MediConnect, you agree to be bound by these Terms of Service and our Privacy Policy.",
      "If you do not agree with any part of these terms, you must not use the platform.",
      "These terms apply to all users, including patients, providers, and care coordinators.",
    ],
  },
  {
    title: "2. Description of Service",
    body: [
      "MediConnect is a specialty medication care coordination portal that helps patients manage their therapy journey and enables providers to review patient progress.",
      "The platform includes care tasks, medication reminders, adherence tracking, secure messaging, document management, and AI-assisted guidance.",
      "MediConnect is a coordination tool only. It does not provide medical advice, diagnose conditions, or replace professional medical judgment.",
    ],
  },
  {
    title: "3. User Accounts",
    body: [
      "You must provide accurate, current, and complete information when creating an account.",
      "You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account.",
      "You must notify MediConnect immediately at support@mediconnect.app if you suspect unauthorized access to your account.",
      "One person may not maintain more than one account. Shared or pooled accounts are not permitted.",
    ],
  },
  {
    title: "4. Acceptable Use",
    body: [
      "You agree to use MediConnect only for lawful purposes and in accordance with these terms.",
      "You must not use the platform to transmit harmful, fraudulent, or misleading content.",
      "You must not attempt to gain unauthorized access to any part of the system, other user accounts, or backend infrastructure.",
      "You must not use automated tools, bots, or scrapers to access or extract data from MediConnect.",
      "Content uploaded to the platform must be yours to share and must not violate third-party rights.",
    ],
  },
  {
    title: "5. Health Information Disclaimer",
    body: [
      "MediConnect is a software platform, not a licensed healthcare provider.",
      "AI-generated summaries, suggested next steps, and guidance features are informational aids only. They do not constitute clinical advice.",
      "Always consult your licensed medical provider before making decisions about your medication, treatment plan, or health.",
      "In a medical emergency, call 911 or your local emergency services immediately.",
    ],
  },
  {
    title: "6. Provider Responsibilities",
    body: [
      "Providers using MediConnect represent that they are licensed healthcare professionals authorized to access patient health information.",
      "Providers are responsible for ensuring their use of patient data complies with applicable law, including HIPAA where applicable.",
      "Providers must not share patient data obtained through MediConnect with unauthorized parties.",
    ],
  },
  {
    title: "7. Intellectual Property",
    body: [
      "All content, design, code, and branding on MediConnect is owned by MediConnect, Inc. or its licensors.",
      "You are granted a limited, non-exclusive, non-transferable license to use the platform for its intended purpose.",
      "You may not copy, modify, distribute, or create derivative works from any MediConnect content without written permission.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    body: [
      "MediConnect is provided 'as is' without warranties of any kind, express or implied.",
      "To the maximum extent permitted by law, MediConnect shall not be liable for any indirect, incidental, special, or consequential damages.",
      "Our total liability for any claim arising from your use of the platform shall not exceed the amount you paid us in the 12 months prior to the claim.",
    ],
  },
  {
    title: "9. Termination",
    body: [
      "We reserve the right to suspend or terminate your account at any time for violation of these terms.",
      "You may delete your account at any time through your account settings or by contacting support@mediconnect.app.",
      "Upon termination, your right to access the platform ceases immediately. We may retain certain data as required by law.",
    ],
  },
  {
    title: "10. Changes to These Terms",
    body: [
      "We may revise these Terms of Service at any time. We will provide at least 14 days notice before material changes take effect.",
      "Continued use of the platform after changes are published constitutes acceptance of the revised terms.",
    ],
  },
  {
    title: "11. Governing Law",
    body: [
      "These terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.",
      "Any disputes arising under these terms shall be resolved through binding arbitration in accordance with JAMS rules.",
    ],
  },
  {
    title: "12. Contact",
    body: [
      "For legal or terms-related inquiries: legal@mediconnect.app",
      "For general support: support@mediconnect.app",
    ],
  },
];

export default function TermsPage() {
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
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
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
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Terms of Service</h1>
        <p className="mt-3 text-sm text-blue-200">Last updated: March 14, 2026</p>
        <p className="mt-4 mx-auto max-w-xl text-base text-blue-100 leading-7">
          Please read these terms carefully before using MediConnect. They govern your rights and
          responsibilities when using the platform.
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
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/terms" className="text-[#2f6cf0]">Terms of Service</Link>
            <Link href="/support" className="hover:text-slate-900 transition">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
