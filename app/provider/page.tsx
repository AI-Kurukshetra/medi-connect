import { redirect } from "next/navigation";

export default function LegacyProviderRoute() {
  redirect("/dashboard");
}

