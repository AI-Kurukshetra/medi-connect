export type IntegrationMode = "mock" | "live";

export function resolveIntegrationMode(name: string): IntegrationMode {
  const value = process.env[`INTEGRATION_${name.toUpperCase()}_MODE`];
  return value === "live" ? "live" : "mock";
}

