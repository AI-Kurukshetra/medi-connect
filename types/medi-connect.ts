export type UserRole = "patient" | "provider";
export type CareTaskStatus = "complete" | "current" | "upcoming";
export type CareTaskSource = "manual" | "ai";
export type AdherenceStatus = "taken" | "missed" | "upcoming";
export type RiskLevel = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface PatientProfile {
  userId: string;
  condition: string;
  therapyStatus: string;
  nextAppointmentAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  refillDueInDays: number;
}

export interface CareTask {
  id: string;
  title: string;
  description: string;
  status: CareTaskStatus;
  dueLabel: string;
  source: CareTaskSource;
}

export interface Reminder {
  id: string;
  title: string;
  window: string;
  channel: string;
}

export interface AdherenceCheckIn {
  id: string;
  dayLabel: string;
  scheduledTime: string;
  status: AdherenceStatus;
  note: string;
}

export interface AssistantInsight {
  id: string;
  title: string;
  summary: string;
  actionLabel: string;
}

export interface MessageDraft {
  id: string;
  authorRole: UserRole;
  subject: string;
  body: string;
  approved: boolean;
}

export interface ProviderSummary {
  riskLevel: RiskLevel;
  adherenceTrend: string;
  blockers: string[];
  recommendedAction: string;
  note: string;
}

export interface TimelineItem {
  label: string;
  detail: string;
}

export interface DemoJourney {
  patient: User;
  provider: User;
  profile: PatientProfile;
  medication: Medication;
  careTasks: CareTask[];
  reminders: Reminder[];
  adherence: AdherenceCheckIn[];
  aiInsights: AssistantInsight[];
  messageDraft: MessageDraft;
  providerSummary: ProviderSummary;
  education: string[];
  timeline: TimelineItem[];
}
