import { resolveIntegrationMode } from "@/lib/integrations/types";

export interface LogisticsShipmentInput {
  trackingNumber: string;
}

export interface LogisticsShipmentResult {
  status: "in_transit" | "delivered" | "unknown";
  location: string;
}

export interface LogisticsClient {
  provider: "mock" | "live";
  trackShipment(input: LogisticsShipmentInput): Promise<LogisticsShipmentResult>;
}

const mockClient: LogisticsClient = {
  provider: "mock",
  async trackShipment(input) {
    return {
      status: input.trackingNumber.endsWith("DEL") ? "delivered" : "in_transit",
      location: "Mock regional hub",
    };
  },
};

const liveClient: LogisticsClient = {
  provider: "live",
  async trackShipment() {
    return { status: "unknown", location: "Live logistics adapter not configured." };
  },
};

export function getLogisticsClient() {
  return resolveIntegrationMode("logistics") === "live" ? liveClient : mockClient;
}

