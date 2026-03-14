import type { Metadata } from "next";
import { PostLoginShell } from "@/components/post-login-shell";
import { SectionCard } from "@/components/section-card";
import { SignOutButton } from "@/components/sign-out-button";
import { requireAuthContext } from "@/lib/auth/server";
import { getScopedPatientProfile } from "@/lib/data/post-login";
import { cx, themeClassNames } from "@/theme";

export const metadata: Metadata = {
  title: "Account",
  alternates: { canonical: "/account" },
};

export default async function AccountPage() {
  const context = await requireAuthContext();
  const profile = await getScopedPatientProfile(context);

  return (
    <PostLoginShell currentPath="/account">
      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Identity" title={context.fullName}>
          <div className="space-y-2">
            <p className={themeClassNames.text.body}>
              <span className={themeClassNames.text.bodyStrong}>Role:</span>{" "}
              {context.role}
            </p>
            <p className={themeClassNames.text.body}>
              <span className={themeClassNames.text.bodyStrong}>User ID:</span>{" "}
              {context.userId}
            </p>
            <p className={cx("mt-4", themeClassNames.text.body)}>
              Update profile fields via <code>/api/account</code>.
            </p>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Security" title="Session">
          <p className={themeClassNames.text.body}>
            Sign out clears both Supabase browser auth and the server session cookie used by protected routes.
          </p>
          <div className="mt-5">
            <SignOutButton />
          </div>
        </SectionCard>
      </section>

      {profile ? (
        <SectionCard eyebrow="Patient profile" title={profile.condition_name}>
          <p className={themeClassNames.text.body}>
            <span className={themeClassNames.text.bodyStrong}>Therapy status:</span>{" "}
            {profile.therapy_status}
          </p>
          <p className={cx("mt-2", themeClassNames.text.body)}>
            <span className={themeClassNames.text.bodyStrong}>Next appointment:</span>{" "}
            {profile.next_appointment_at
              ? new Date(profile.next_appointment_at).toLocaleString()
              : "Not set"}
          </p>
        </SectionCard>
      ) : null}
    </PostLoginShell>
  );
}

