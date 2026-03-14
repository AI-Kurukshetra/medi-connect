"use client";

import { useState } from "react";

const FAQS = [
  {
    id: "insurance",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="#4f86ff" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="#4f86ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    question: "Insurance questions",
    answer:
      "We accept most major insurance providers including Aetna, Blue Cross Blue Shield, and Cigna. You can verify your specific plan by uploading your insurance card in the \"Billing\" tab of your profile. For out-of-network inquiries, please contact our billing department.",
  },
  {
    id: "prior-auth",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" stroke="#a78bfa" strokeWidth="1.6" />
        <path d="M9 7h6M9 11h6M9 15h4" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    question: "Prior authorization",
    answer:
      "Prior authorization (PA) is required by most insurance plans before they cover specialty medications. MediConnect tracks your PA status automatically. You can view your current PA stage under the Prior Auth section in the portal. Most approvals take 3–7 business days.",
  },
  {
    id: "medication",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 8v8M8 12h8" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="#34d399" strokeWidth="1.6" />
      </svg>
    ),
    question: "Medication schedule",
    answer:
      "Your medication schedule is set up during onboarding and visible in Reminders. You can adjust dose timing in Account → Notification Preferences. If you need to modify your prescription schedule, contact your provider through the Messages section.",
  },
  {
    id: "adherence",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12l4 4L17 6" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 6l-9.5 9.5" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    question: "Tracking adherence",
    answer:
      "Your adherence score is updated every time you log a dose in the Adherence section. Green days mean the dose was logged, red means missed. Your provider can see this trend, so consistent logging helps your care team make better decisions.",
  },
  {
    id: "messages",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#0ea5e9" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
    question: "Messaging my care team",
    answer:
      "You can message your assigned provider directly from the Messages section. Messages are reviewed during business hours (Mon–Fri, 9am–5pm). For urgent medical concerns, please call your provider's office or use the Emergency section.",
  },
];

export function FaqPanel() {
  const [openId, setOpenId] = useState<string | null>("insurance");

  return (
    <div className="space-y-4">
      {/* FAQ accordion */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_4px_20px_-8px_rgba(15,23,42,0.1)]">
        {FAQS.map((faq, index) => (
          <div key={faq.id} className={index > 0 ? "border-t border-slate-100" : ""}>
            <button
              type="button"
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
                {faq.icon}
              </span>
              <span className="flex-1 text-sm font-semibold text-slate-800">{faq.question}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className={`shrink-0 text-slate-400 transition-transform duration-200 ${openId === faq.id ? "rotate-180" : ""}`}
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {openId === faq.id && (
              <div className="px-5 pb-4 pt-0 text-sm leading-7 text-slate-600">
                <div className="ml-11">{faq.answer}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Still need help card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.1)]">
        {/* Decorative circle */}
        <div className="absolute right-4 bottom-4 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] shadow-[0_8px_24px_-8px_rgba(59,130,246,0.6)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.6" />
            <path d="M12 8v4l3 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>

        <p className="text-base font-semibold text-slate-900">Still need help?</p>
        <p className="mt-1 text-sm text-slate-500 max-w-xs">
          Our support team is available Monday through Friday, 9am – 6pm EST.
        </p>

        <div className="mt-4 space-y-2.5">
          <a
            href="tel:18006334357"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.16 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" stroke="#4f86ff" strokeWidth="1.6" />
            </svg>
            1-800-MEDI-HELP
          </a>
          <a
            href="mailto:support@mediconnect.app"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#4f86ff" strokeWidth="1.6" />
              <path d="M22 6l-10 7L2 6" stroke="#4f86ff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            support@mediconnect.app
          </a>
        </div>
      </div>
    </div>
  );
}
