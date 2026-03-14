import { resolveIntegrationMode } from "@/lib/integrations/types";

export interface PaymentChargeInput {
  amountCents: number;
  currency: string;
  invoiceNumber: string;
}

export interface PaymentChargeResult {
  providerRef: string;
  status: "pending" | "succeeded" | "failed";
}

export interface PaymentClient {
  provider: "mock" | "live";
  charge(input: PaymentChargeInput): Promise<PaymentChargeResult>;
  reconcile(providerRef: string): Promise<"reconciled" | "pending">;
}

const mockClient: PaymentClient = {
  provider: "mock",
  async charge(input) {
    const providerRef = `mock_ch_${input.invoiceNumber}_${Date.now()}`;
    return { providerRef, status: "succeeded" };
  },
  async reconcile() {
    return "reconciled";
  },
};

const liveClient: PaymentClient = {
  provider: "live",
  async charge(input) {
    const providerRef = `live_pending_${input.invoiceNumber}_${Date.now()}`;
    return { providerRef, status: "pending" };
  },
  async reconcile() {
    return "pending";
  },
};

export function getPaymentClient() {
  return resolveIntegrationMode("payments") === "live" ? liveClient : mockClient;
}

