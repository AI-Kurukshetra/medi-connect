import { NextResponse } from "next/server";
import { jsonValidationError, requireApiAuthContext } from "@/lib/auth/api";
import {
  canAccessPatientProfile,
  resolveScopedPatientProfile,
} from "@/lib/data/role-scope";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["taken", "missed", "upcoming"]);

interface AdherenceBody {
  id?: string;
  patientProfileId?: string;
  medicationPlanId?: string | null;
  scheduledFor?: string | null;
  status?: string;
  note?: string;
}

export async function GET(request: Request) {
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const scoped = await resolveScopedPatientProfile(
    auth.context,
    searchParams.get("patientProfileId"),
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
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from("adherence_check_ins")
    .select("id, patient_profile_id, medication_plan_id, scheduled_for, status, note, updated_at")
    .eq("patient_profile_id", patientProfileId)
    .order("scheduled_for", { ascending: false, nullsFirst: false });

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

  const body = (await request.json()) as AdherenceBody;
  const scoped = await resolveScopedPatientProfile(
    auth.context,
    body.patientProfileId,
  );
  const patientProfileId = scoped.patientProfileId;

  if (scoped.unauthorizedRequest) {
    return NextResponse.json({ error: "Patient profile not found." }, { status: 404 });
  }

  if (!patientProfileId) {
    return NextResponse.json({ error: "Patient profile not found." }, { status: 404 });
  }

  if (!body.status || !allowedStatuses.has(body.status)) {
    return jsonValidationError("Invalid adherence status.");
  }

  const note = body.note?.trim() ?? "";
  const serviceClient = getSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from("adherence_check_ins")
    .insert({
      patient_profile_id: patientProfileId,
      medication_plan_id: body.medicationPlanId ?? null,
      scheduled_for: body.scheduledFor ?? null,
      status: body.status,
      note,
    })
    .select("id, patient_profile_id, medication_plan_id, scheduled_for, status, note, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roleMode: auth.context.role, item: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as AdherenceBody;
  const id = body.id?.trim();

  if (!id) {
    return jsonValidationError("id is required.");
  }

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("adherence_check_ins")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Adherence record not found." }, { status: 404 });
  }

  const hasAccess = await canAccessPatientProfile(
    auth.context,
    existing.patient_profile_id,
  );
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const updates: Record<string, string | null> = {};

  if (body.status) {
    if (!allowedStatuses.has(body.status)) {
      return jsonValidationError("Invalid adherence status.");
    }
    updates.status = body.status;
  }

  if (typeof body.note === "string") {
    updates.note = body.note.trim();
  }

  if (auth.context.role === "provider") {
    if (typeof body.scheduledFor === "string" || body.scheduledFor === null) {
      updates.scheduled_for = body.scheduledFor ?? null;
    }
  } else if (typeof body.scheduledFor === "string" || body.scheduledFor === null) {
    return NextResponse.json(
      { error: "Patients cannot update scheduled timing fields." },
      { status: 403 },
    );
  }

  const { data, error } = await serviceClient
    .from("adherence_check_ins")
    .update(updates)
    .eq("id", id)
    .select("id, patient_profile_id, medication_plan_id, scheduled_for, status, note, updated_at")
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
    .from("adherence_check_ins")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Adherence record not found." }, { status: 404 });
  }

  const hasAccess = await canAccessPatientProfile(
    auth.context,
    existing.patient_profile_id,
  );
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { error } = await serviceClient
    .from("adherence_check_ins")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roleMode: auth.context.role, deletedId: id });
}
