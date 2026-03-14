import type { Metadata } from "next";
import { PostLoginShell } from "@/components/post-login-shell";
import { SectionCard } from "@/components/section-card";
import { SignOutButton } from "@/components/sign-out-button";
import { StatusPill } from "@/components/status-pill";
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
      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <SectionCard
          className={themeClassNames.heroSectionCard}
          eyebrow="Account center"
          title={context.fullName}
          description="Account, session, and profile details now live inside the same dashboard structure as the rest of the product."
        >
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusPill tone="accent">{context.role} account</StatusPill>
            <StatusPill>User workspace</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={themeClassNames.softPanel}>
              <p className={themeClassNames.text.label}>Role</p>
              <p className={cx("mt-2", themeClassNames.text.bodyStrong)}>{context.role}</p>
            </div>
            <div className={themeClassNames.softPanel}>
              <p className={themeClassNames.text.label}>User ID</p>
              <p className={cx("mt-2 break-all", themeClassNames.text.bodyStrong)}>{context.userId}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Session controls"
          title="Security"
          description="Sign out is always available from the header, but this page keeps account-specific actions grouped together."
        >
          <div className="space-y-3">
            <div className={themeClassNames.subtlePanel}>
              <p className={themeClassNames.text.body}>
                Sign out clears both Supabase browser auth and the server session cookie used by protected routes.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <SignOutButton />
          </div>
        </SectionCard>
      </section>

      {profile ? (
        <SectionCard
          eyebrow="Linked profile"
          title={profile.condition_name}
          description="Patient profile details stay visible alongside account information for faster review."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={themeClassNames.softPanel}>
              <p className={themeClassNames.text.label}>Therapy status</p>
              <p className={cx("mt-2", themeClassNames.text.bodyStrong)}>{profile.therapy_status}</p>
            </div>
            <div className={themeClassNames.softPanel}>
              <p className={themeClassNames.text.label}>Next appointment</p>
              <p className={cx("mt-2", themeClassNames.text.bodyStrong)}>
                {profile.next_appointment_at
                  ? new Date(profile.next_appointment_at).toLocaleString()
                  : "Not set"}
              </p>
            </div>
          </div>
        </SectionCard>
      ) : null}
    </PostLoginShell>
  );
}
