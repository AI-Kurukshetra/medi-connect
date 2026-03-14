import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PostLoginShell } from "@/components/post-login-shell";
import { requireAuthContext } from "@/lib/auth/server";
import { getScopedPatientProfile } from "@/lib/data/post-login";
import { cx } from "@/theme";

export const metadata: Metadata = {
  title: "Account",
  alternates: { canonical: "/account" },
};

function deriveEmail(fullName: string) {
  const slug = fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".");
  return `${slug.replace(/^\.+|\.+$/g, "") || "mediconnect.user"}@example.com`;
}

function AccountCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.22)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <span className="text-slate-300">/</span>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "muted";
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p
        className={cx(
          "mt-2 text-sm font-medium",
          tone === "success"
            ? "text-emerald-500"
            : tone === "muted"
              ? "text-slate-400"
              : "text-slate-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default async function AccountPage() {
  const context = await requireAuthContext();
  const profile = await getScopedPatientProfile(context);
  const initials = context.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const email = deriveEmail(context.fullName);
  const dateOfBirth = "May 15, 1988";

  return (
    <PostLoginShell currentPath="/account">
      <section>
        <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-slate-900">My Account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and preferences.
        </p>

        <div className="mt-7 grid gap-6 xl:grid-cols-[280px_1fr]">
          <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.22)]">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fde3c0,#f4c087)] text-3xl font-semibold text-slate-700">
                {initials || "MC"}
              </div>
              <p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                {context.fullName}
              </p>
              <p className="mt-1 text-sm text-slate-400">Member since Jan 2022</p>
              {profile ? (
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {profile.condition_name}
                </p>
              ) : null}
              {/* <button
                type="button"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-slate-100 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Edit Photo
              </button> */}
            </div>
          </section>

          <div className="space-y-4">
            <AccountCard title="Personal Information">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" value={context.fullName} />
                <Field label="Email Address" value={email} />
                <Field label="Phone Number" value="+1 (555) 000-1234" />
                <Field label="Date of Birth" value={dateOfBirth} />
              </div>
            </AccountCard>

            <AccountCard title="Address">
              <div className="space-y-2 text-sm leading-7 text-slate-700">
                <p>123 Healthcare Blvd, Suite 400</p>
                <p>Medical District, Cityville, ST 54321</p>
                <p>United States</p>
              </div>
            </AccountCard>

            <AccountCard title="Insurance Details">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Provider"
                  value={context.role === "provider" ? "BlueShield Global Care Partner" : "BlueShield Global Care"}
                />
                <Field
                  label="Policy Number"
                  value={context.role === "provider" ? "PR-9900223311" : "BS-9900223311"}
                />
              </div>
            </AccountCard>

            <AccountCard title="Notification Preferences">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-700">Email Notifications</p>
                  <p className="text-sm font-semibold text-emerald-500">Enabled</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-700">SMS Appointment Reminders</p>
                  <p className="text-sm font-semibold text-emerald-500">Enabled</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-700">Marketing & Newsletters</p>
                  <p className="text-sm font-semibold text-slate-400">Disabled</p>
                </div>
              </div>
            </AccountCard>

            {/* <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#356ae6] px-5 text-sm font-semibold text-white shadow-[0_18px_30px_-20px_rgba(37,99,235,0.65)] transition hover:bg-[#2959d6]"
              >
                Save Changes
              </button>
            </div> */}

            <section className="rounded-[18px] border border-red-100 bg-red-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-red-500">Danger Zone</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-red-400">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                >
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </PostLoginShell>
  );
}
