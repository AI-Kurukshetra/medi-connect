import type { AuthContext } from "@/lib/auth/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export interface AuditEventInput {
  context: AuthContext;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  traceId: string;
  scopeContext: Record<string, string | number | boolean | null>;
  metadata?: Record<string, string | number | boolean | null>;
}

export async function createAuditEvent(input: AuditEventInput): Promise<string | null> {
  const serviceClient = getSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from("audit_events")
    .insert({
      actor_user_id: input.context.userId,
      actor_role: input.context.role,
      action: input.action,
      resource_type: input.resourceType,
      resource_id: input.resourceId ?? null,
      trace_id: input.traceId,
      scope_context: input.scopeContext,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error) {
    return null;
  }

  return data?.id ?? null;
}

export function redactedMetadata(metadata: Record<string, unknown>) {
  const safe: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string") {
      safe[key] = value.length > 120 ? `${value.slice(0, 117)}...` : value;
      continue;
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      safe[key] = value;
      continue;
    }

    safe[key] = null;
  }

  return safe;
}

