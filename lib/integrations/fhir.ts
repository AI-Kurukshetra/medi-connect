import { resolveIntegrationMode } from "@/lib/integrations/types";

export interface FhirPatientSummary {
  resources: Array<"Patient" | "Practitioner" | "MedicationRequest" | "CarePlan" | "Observation" | "DocumentReference">;
  summary: string;
}

export interface FhirClient {
  provider: "mock" | "live";
  fetchPatientSummary(externalPatientId: string): Promise<FhirPatientSummary>;
}

const mockClient: FhirClient = {
  provider: "mock",
  async fetchPatientSummary(externalPatientId) {
    return {
      resources: [
        "Patient",
        "Practitioner",
        "MedicationRequest",
        "CarePlan",
        "Observation",
        "DocumentReference",
      ],
      summary: `FHIR R4 mock summary for external patient ${externalPatientId}.`,
    };
  },
};

const liveClient: FhirClient = {
  provider: "live",
  async fetchPatientSummary() {
    return {
      resources: ["Patient", "CarePlan"],
      summary: "Live FHIR connector is configured but not connected in this environment.",
    };
  },
};

export function getFhirClient() {
  return resolveIntegrationMode("fhir") === "live" ? liveClient : mockClient;
}

