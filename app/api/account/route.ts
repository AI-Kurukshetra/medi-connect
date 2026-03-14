import { NextResponse } from "next/server";
import { jsonValidationError, requireApiAuthContext } from "@/lib/auth/api";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface AccountBody {
  fullName?: string;
  conditionName?: string;
  therapyStatus?: string;
  nextAppointmentAt?: string | null;
}

export async function GET() {
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const serviceClient = getSupabaseServiceClient();
  const [profileResult, patientProfileResult] = await Promise.all([
    serviceClient
      .from("profiles")
      .select("id, role, full_name, created_at, updated_at")
      .eq("id", auth.context.userId)
      .single(),
    serviceClient
      .from("patient_profiles")
      .select("id, condition_name, therapy_status, next_appointment_at, created_at, updated_at")
      .eq("user_id", auth.context.userId)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    return NextResponse.json({ error: profileResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    roleMode: auth.context.role,
    profile: profileResult.data,
    patientProfile: patientProfileResult.data ?? null,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireApiAuthContext();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as AccountBody;
  const serviceClient = getSupabaseServiceClient();

  if (typeof body.fullName === "string") {
    const value = body.fullName.trim();
    if (!value) return jsonValidationError("fullName cannot be empty.");

    const { error } = await serviceClient
      .from("profiles")
      .update({ full_name: value })
      .eq("id", auth.context.userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const hasPatientProfileUpdates =
    typeof body.conditionName === "string" ||
    typeof body.therapyStatus === "string" ||
    typeof body.nextAppointmentAt === "string" ||
    body.nextAppointmentAt === null;

  if (hasPatientProfileUpdates) {
    if (auth.context.role !== "patient" || !auth.context.patientProfileId) {
      return NextResponse.json(
        { error: "Only patient accounts can update patient profile fields." },
        { status: 403 },
      );
    }

    const patientUpdates: Record<string, string | null> = {};
    if (typeof body.conditionName === "string") {
      patientUpdates.condition_name = body.conditionName.trim();
    }
    if (typeof body.therapyStatus === "string") {
      patientUpdates.therapy_status = body.therapyStatus.trim();
    }
    if (typeof body.nextAppointmentAt === "string" || body.nextAppointmentAt === null) {
      patientUpdates.next_appointment_at = body.nextAppointmentAt ?? null;
    }

    const { error } = await serviceClient
      .from("patient_profiles")
      .update(patientUpdates)
      .eq("id", auth.context.patientProfileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return GET();
}

