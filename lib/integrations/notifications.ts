import { resolveIntegrationMode } from "@/lib/integrations/types";

export interface NotificationInput {
  channel: "sms" | "email" | "in-app";
  recipient: string;
  message: string;
}

export interface NotificationResult {
  providerRef: string;
  status: "queued" | "sent";
}

export interface NotificationClient {
  provider: "mock" | "live";
  send(input: NotificationInput): Promise<NotificationResult>;
}

const mockClient: NotificationClient = {
  provider: "mock",
  async send(input) {
    return {
      providerRef: `mock_ntf_${input.channel}_${Date.now()}`,
      status: "sent",
    };
  },
};

const liveClient: NotificationClient = {
  provider: "live",
  async send(input) {
    return {
      providerRef: `live_ntf_${input.channel}_${Date.now()}`,
      status: "queued",
    };
  },
};

export function getNotificationClient() {
  return resolveIntegrationMode("notifications") === "live"
    ? liveClient
    : mockClient;
}

