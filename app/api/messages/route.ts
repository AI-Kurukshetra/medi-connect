import { NextResponse } from "next/server";
import { jsonValidationError, requireApiAuthContext } from "@/lib/auth/api";
import {
  canAccessPatientProfile,
  resolveScopedPatientProfile,
} from "@/lib/data/role-scope";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface MessageBody {
  id?: string;
  patientProfileId?: string;
  subject?: string;
  body?: string;
  approved?: boolean;
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
    .from("message_drafts")
    .select("id, patient_profile_id, author_role, subject, body, approved, updated_at")
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

  const body = (await request.json()) as MessageBody;
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

  if (!body.subject?.trim() || !body.body?.trim()) {
    return jsonValidationError("subject and body are required.");
  }

  const approved = auth.context.role === "provider" ? Boolean(body.approved) : false;

  const serviceClient = getSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from("message_drafts")
    .insert({
      patient_profile_id: patientProfileId,
      author_role: auth.context.role,
      subject: body.subject.trim(),
      body: body.body.trim(),
      approved,
    })
    .select("id, patient_profile_id, author_role, subject, body, approved, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roleMode: auth.context.role, item: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as MessageBody;
  const id = body.id?.trim();
  if (!id) return jsonValidationError("id is required.");

  const serviceClient = getSupabaseServiceClient();
  const { data: existing } = await serviceClient
    .from("message_drafts")
    .select("id, patient_profile_id, author_role")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Message draft not found." }, { status: 404 });
  }

  const hasAccess = await canAccessPatientProfile(
    auth.context,
    existing.patient_profile_id,
  );
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const updates: Record<string, string | boolean> = {};
  if (typeof body.subject === "string") updates.subject = body.subject.trim();
  if (typeof body.body === "string") updates.body = body.body.trim();

  if (typeof body.approved === "boolean") {
    if (auth.context.role !== "provider") {
      return NextResponse.json(
        { error: "Only providers can approve drafts." },
        { status: 403 },
      );
    }
    updates.approved = body.approved;
  }

  if (auth.context.role === "patient" && existing.author_role === "provider") {
    return NextResponse.json(
      { error: "Patients cannot modify provider-authored drafts." },
      { status: 403 },
    );
  }

  const { data, error } = await serviceClient
    .from("message_drafts")
    .update(updates)
    .eq("id", id)
    .select("id, patient_profile_id, author_role, subject, body, approved, updated_at")
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
    .from("message_drafts")
    .select("id, patient_profile_id, author_role")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Message draft not found." }, { status: 404 });
  }

  const hasAccess = await canAccessPatientProfile(
    auth.context,
    existing.patient_profile_id,
  );
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (auth.context.role === "patient" && existing.author_role !== "patient") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { error } = await serviceClient
    .from("message_drafts")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roleMode: auth.context.role, deletedId: id });
}
