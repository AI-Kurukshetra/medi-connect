import { NextResponse } from "next/server";
import { jsonValidationError, requireApiAuthContext } from "@/lib/auth/api";
import { ensurePatientProfile } from "@/lib/auth/profile-sync";
import { canAccessPatientProfile, resolveScopedPatientProfile } from "@/lib/data/role-scope";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["complete", "current", "upcoming"]);
const allowedSources = new Set(["manual", "ai"]);

interface TaskBody {
  id?: string;
  patientProfileId?: string;
  title?: string;
  description?: string;
  status?: string;
  dueAt?: string | null;
  dueLabel?: string | null;
  source?: string;
}

export async function GET(request: Request) {
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const requestedPatientProfileId = searchParams.get("patientProfileId");
  const scoped = await resolveScopedPatientProfile(
    auth.context,
    requestedPatientProfileId,
  );
  const patientProfileId = scoped.patientProfileId;

  if (scoped.unauthorizedRequest) {
    return NextResponse.json({ error: "Patient profile not found." }, { status: 404 });
  }

  if (!patientProfileId) {
    return NextResponse.json({
      roleMode: auth.context.role,
      patientProfileId: null,
      items: [],
      emptyState:
        auth.context.role === "provider"
          ? "No assigned patient profile was found yet."
          : "Your patient profile is not ready yet.",
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from("care_tasks")
    .select("id, patient_profile_id, title, description, status, due_at, due_label, source, updated_at")
    .eq("patient_profile_id", patientProfileId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    roleMode: auth.context.role,
    patientProfileId,
    items: data ?? [],
  });
}

export async function POST(request: Request) {
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as TaskBody;
  const scoped = await resolveScopedPatientProfile(
    auth.context,
    body.patientProfileId,
  );
  let patientProfileId = scoped.patientProfileId;

  if (scoped.unauthorizedRequest) {
    return NextResponse.json({ error: "Patient profile not found." }, { status: 404 });
  }

  if (!patientProfileId && auth.context.role === "patient") {
    patientProfileId = await ensurePatientProfile(auth.context.userId);
  }

  if (!patientProfileId) {
    return NextResponse.json({ error: "Patient profile not found." }, { status: 404 });
  }

  if (!body.title?.trim() || !body.description?.trim()) {
    return jsonValidationError("title and description are required.");
  }

  if (!body.status || !allowedStatuses.has(body.status)) {
    return jsonValidationError("Invalid task status.");
  }

  const source =
    auth.context.role === "provider"
      ? allowedSources.has(body.source ?? "") ? body.source : "ai"
      : "manual";

  const serviceClient = getSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from("care_tasks")
    .insert({
      patient_profile_id: patientProfileId,
      title: body.title.trim(),
      description: body.description.trim(),
      status: body.status,
      due_at: body.dueAt ?? null,
      due_label: body.dueLabel ?? null,
      source,
    })
    .select("id, patient_profile_id, title, description, status, due_at, due_label, source, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roleMode: auth.context.role, item: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as TaskBody;
  const id = body.id?.trim();
  if (!id) {
    return jsonValidationError("id is required.");
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("care_tasks")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  const hasAccess = await canAccessPatientProfile(
    auth.context,
    existing.patient_profile_id,
  );
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const updates: Record<string, string | null> = {};

  if (typeof body.title === "string") updates.title = body.title.trim();
  if (typeof body.description === "string") updates.description = body.description.trim();
  if (typeof body.dueLabel === "string" || body.dueLabel === null) {
    updates.due_label = body.dueLabel ?? null;
  }
  if (typeof body.dueAt === "string" || body.dueAt === null) {
    updates.due_at = body.dueAt ?? null;
  }

  if (body.status) {
    if (!allowedStatuses.has(body.status)) {
      return jsonValidationError("Invalid task status.");
    }
    updates.status = body.status;
  }

  if (auth.context.role === "provider" && body.source) {
    if (!allowedSources.has(body.source)) {
      return jsonValidationError("Invalid task source.");
    }
    updates.source = body.source;
  }

  if (auth.context.role === "patient" && body.source) {
    return NextResponse.json(
      { error: "Patients cannot update the source field." },
      { status: 403 },
    );
  }

  const { data, error } = await serviceClient
    .from("care_tasks")
    .update(updates)
    .eq("id", id)
    .select("id, patient_profile_id, title, description, status, due_at, due_label, source, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roleMode: auth.context.role, item: data });
}

export async function DELETE(request: Request) {
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return jsonValidationError("id query parameter is required.");
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("care_tasks")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  const hasAccess = await canAccessPatientProfile(
    auth.context,
    existing.patient_profile_id,
  );
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { error } = await serviceClient.from("care_tasks").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roleMode: auth.context.role, deletedId: id });
}
