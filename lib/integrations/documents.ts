import { resolveIntegrationMode } from "@/lib/integrations/types";

export interface SignedUrlPayload {
  signedUrl: string;
  expiresAt: string;
}

export interface DocumentClient {
  provider: "mock" | "live";
  createSignedDownloadUrl(storageKey: string): Promise<SignedUrlPayload>;
}

const createMockSignedUrl = (storageKey: string) => {
  const token = Buffer.from(`${storageKey}:${Date.now()}`).toString("base64url");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
  return {
    signedUrl: `https://mock-docs.mediconnect.local/download/${encodeURIComponent(storageKey)}?token=${token}`,
    expiresAt,
  };
};

const mockClient: DocumentClient = {
  provider: "mock",
  async createSignedDownloadUrl(storageKey) {
    return createMockSignedUrl(storageKey);
  },
};

const liveClient: DocumentClient = {
  provider: "live",
  async createSignedDownloadUrl(storageKey) {
    return createMockSignedUrl(storageKey);
  },
};

export function getDocumentClient() {
  return resolveIntegrationMode("documents") === "live" ? liveClient : mockClient;
}

