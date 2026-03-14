import type { DemoJourney } from "@/types/medi-connect";

export const patientJourney: DemoJourney = {
  patient: {
    id: "patient-maya-patel",
    name: "Maya Patel",
    role: "patient",
  },
  provider: {
    id: "provider-elena-brooks",
    name: "Dr. Elena Brooks",
    role: "provider",
  },
  profile: {
    userId: "patient-maya-patel",
    condition: "Rheumatoid arthritis",
    therapyStatus: "Ready for first at-home injection",
    nextAppointmentAt: "Thursday, March 20 at 10:00 AM",
  },
  medication: {
    id: "med-humira",
    name: "Humira",
    dosage: "40 mg pen",
    frequency: "Every other Tuesday",
    instructions:
      "Remove the pen from the refrigerator 15 minutes before use and log any injection-site reaction after the dose.",
    refillDueInDays: 9,
  },
  careTasks: [
    {
      id: "task-injection-checklist",
      title: "Review the injection day checklist",
      description: "AI translated the start plan into three simple prep steps.",
      status: "complete",
      dueLabel: "Completed today",
      source: "ai",
    },
    {
      id: "task-baseline",
      title: "Submit your symptom baseline",
      description: "This gives the care team a before-and-after snapshot for week one.",
      status: "current",
      dueLabel: "Due before Tuesday evening",
      source: "manual",
    },
    {
      id: "task-reminder-window",
      title: "Confirm your reminder window",
      description: "Pick the time that feels best for refill and dose nudges.",
      status: "current",
      dueLabel: "Set tonight",
      source: "ai",
    },
    {
      id: "task-follow-up-questions",
      title: "Review the drafted follow-up questions",
      description: "AI prepared questions about mild reactions and travel storage.",
      status: "upcoming",
      dueLabel: "Before Thursday follow-up",
      source: "ai",
    },
  ],
  reminders: [
    {
      id: "reminder-prep",
      title: "Injection prep reminder",
      window: "Monday at 7:00 PM",
      channel: "SMS + in-app",
    },
    {
      id: "reminder-dose",
      title: "First dose check-in",
      window: "Tuesday at 7:30 PM",
      channel: "In-app",
    },
    {
      id: "reminder-refill",
      title: "Refill planning reminder",
      window: "In 9 days",
      channel: "Email",
    },
  ],
  adherence: [
    {
      id: "check-in-onboarding",
      dayLabel: "Today",
      scheduledTime: "8:00 PM",
      status: "taken",
      note: "Onboarding checklist reviewed successfully.",
    },
    {
      id: "check-in-first-dose",
      dayLabel: "Tuesday",
      scheduledTime: "7:30 PM",
      status: "upcoming",
      note: "First dose reminder and side-effect check-in are queued.",
    },
    {
      id: "check-in-follow-up",
      dayLabel: "Thursday",
      scheduledTime: "10:00 AM",
      status: "upcoming",
      note: "Care coordinator follow-up after the first dose.",
    },
  ],
  aiInsights: [
    {
      id: "insight-steps",
      title: "Your next-step plan",
      summary:
        "Before Tuesday, finish your symptom baseline and confirm the reminder window. The injection prep checklist is already complete.",
      actionLabel: "Open checklist",
    },
    {
      id: "insight-questions",
      title: "Questions drafted for your care team",
      summary:
        "I prepared a short note about injection-site reactions, travel storage, and what to expect after the first dose.",
      actionLabel: "Review draft",
    },
    {
      id: "insight-refill",
      title: "Refill timing forecast",
      summary:
        "At the current schedule, request your next refill in 9 days to avoid a therapy gap.",
      actionLabel: "Set reminder",
    },
  ],
  messageDraft: {
    id: "draft-care-team",
    authorRole: "patient",
    subject: "Questions before my first Humira dose",
    body: "Hi care team, I reviewed the checklist for my first dose. Can you confirm what mild injection-site reactions are normal and whether I should change timing if I travel next week?",
    approved: false,
  },
  providerSummary: {
    riskLevel: "medium",
    adherenceTrend: "On track with two setup tasks still open",
    blockers: [
      "Symptom baseline not submitted yet",
      "Reminder window still needs approval",
    ],
    recommendedAction:
      "Send a short follow-up today and keep the Thursday symptom review on the calendar.",
    note: "AI summary: patient is engaged, understands the care plan, and has not reported any urgent safety concerns.",
  },
  education: [
    "Remove the pen from the refrigerator about 15 minutes before use.",
    "Call your care team if redness lasts more than 48 hours or swelling worsens.",
    "Keep the Thursday follow-up so your team can review your first-dose experience.",
  ],
  timeline: [
    {
      label: "Prescription reviewed",
      detail: "Provider approved the biologic start plan and simplified education packet.",
    },
    {
      label: "Patient onboarding completed",
      detail: "AI turned the medication instructions into a plain-language checklist.",
    },
    {
      label: "First dose scheduled",
      detail: "Tuesday at 7:30 PM with reminder coverage across SMS and in-app.",
    },
    {
      label: "Provider follow-up planned",
      detail: "Thursday morning review will confirm adherence and symptom response.",
    },
  ],
};
