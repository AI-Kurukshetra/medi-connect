import { redirect } from "next/navigation";

export default function LegacyPatientRoute() {
  redirect("/dashboard");
}

