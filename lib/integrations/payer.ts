import { resolveIntegrationMode } from "@/lib/integrations/types";

export interface PayerVerificationInput {
  payerName: string;
  memberId: string;
  medicationName: string;
}

export interface PayerVerificationResult {
  status: "verified" | "rejected" | "manual_review";
  priorAuthRequired: boolean;
  coverageSummary: string;
}

export interface PayerClient {
  provider: "mock" | "live";
  verifyBenefits(input: PayerVerificationInput): Promise<PayerVerificationResult>;
}

const mockClient: PayerClient = {
  provider: "mock",
  async verifyBenefits(input) {
    const requiresPriorAuth = input.medicationName.toLowerCase().includes("humira");

    return {
      status: "verified",
      priorAuthRequired: requiresPriorAuth,
      coverageSummary: requiresPriorAuth
        ? "Coverage active with prior authorization required."
        : "Coverage active with no prior authorization requirement.",
    };
  },
};

const liveClient: PayerClient = {
  provider: "live",
  async verifyBenefits() {
    return {
      status: "manual_review",
      priorAuthRequired: true,
      coverageSummary: "Live payer adapter is configured but not connected in this environment.",
    };
  },
};

export function getPayerClient(): PayerClient {
  return resolveIntegrationMode("payer") === "live" ? liveClient : mockClient;
}

