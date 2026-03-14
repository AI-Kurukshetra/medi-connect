import { NextResponse } from "next/server";
import { jsonValidationError, requireApiAuthContext } from "@/lib/auth/api";
import {
  canAccessPatientProfile,
  resolveScopedPatientProfile,
} from "@/lib/data/role-scope";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["scheduled", "sent", "cancelled"]);

interface ReminderBody {
  id?: string;
  patientProfileId?: string;
  title?: string;
  sendAt?: string | null;
  windowLabel?: string;
  channel?: string;
  status?: string;
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
      emptyState:
        auth.context.role === "provider"
          ? "No assigned reminder stream is available for this provider yet."
          : "No reminder schedule exists yet for your account.",
    });
  }

  const serviceClient = getSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from("reminders")
    .select("id, patient_profile_id, title, send_at, window_label, channel, status, updated_at")
    .eq("patient_profile_id", patientProfileId)
    .order("send_at", { ascending: true, nullsFirst: false });

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

  const body = (await request.json()) as ReminderBody;
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

  if (!body.title?.trim() || !body.windowLabel?.trim()) {
    return jsonValidationError("title and windowLabel are required.");
  }

  const reminderStatus = body.status ?? "scheduled";
  if (!allowedStatuses.has(reminderStatus)) {
    return jsonValidationError("Invalid reminder status.");
  }

  const channel = auth.context.role === "provider" ? body.channel ?? "in-app" : "in-app";

  const serviceClient = getSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from("reminders")
    .insert({
      patient_profile_id: patientProfileId,
      title: body.title.trim(),
      send_at: body.sendAt ?? null,
      window_label: body.windowLabel.trim(),
      channel,
      status: reminderStatus,
    })
    .select("id, patient_profile_id, title, send_at, window_label, channel, status, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roleMode: auth.context.role, item: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as ReminderBody;
  const id = body.id?.trim();
  if (!id) return jsonValidationError("id is required.");

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("reminders")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Reminder not found." }, { status: 404 });
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
  if (typeof body.windowLabel === "string") updates.window_label = body.windowLabel.trim();
  if (typeof body.sendAt === "string" || body.sendAt === null) {
    updates.send_at = body.sendAt ?? null;
  }
  if (body.status) {
    if (!allowedStatuses.has(body.status)) {
      return jsonValidationError("Invalid reminder status.");
    }
    updates.status = body.status;
  }
  if (typeof body.channel === "string") {
    if (auth.context.role !== "provider") {
      return NextResponse.json(
        { error: "Patients cannot update reminder channel." },
        { status: 403 },
      );
    }
    updates.channel = body.channel.trim();
  }

  const { data, error } = await serviceClient
    .from("reminders")
    .update(updates)
    .eq("id", id)
    .select("id, patient_profile_id, title, send_at, window_label, channel, status, updated_at")
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
  if (!id) return jsonValidationError("id query parameter is required.");

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("reminders")
    .select("id, patient_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Reminder not found." }, { status: 404 });
  }

  const hasAccess = await canAccessPatientProfile(
    auth.context,
    existing.patient_profile_id,
  );
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { error } = await serviceClient.from("reminders").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roleMode: auth.context.role, deletedId: id });
}
