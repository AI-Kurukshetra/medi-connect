import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { requireAuthContext, type AppRole } from "@/lib/auth/server";
import { cx } from "@/theme";

interface PostLoginShellProps {
  currentPath: string;
  children: ReactNode;
}

type SidebarIconName =
  | "dashboard"
  | "tasks"
  | "adherence"
  | "reminders"
  | "messages"
  | "support"
  | "account"
  | "insights";

interface SidebarItem {
  href: string;
  label: string;
  icon: SidebarIconName;
}

const primaryRoutes: SidebarItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/tasks", label: "Tasks", icon: "tasks" },
  { href: "/adherence", label: "Adherence", icon: "adherence" },
  { href: "/reminders", label: "Reminders", icon: "reminders" },
  { href: "/messages", label: "Messages", icon: "messages" },
];

const secondaryRoutes: SidebarItem[] = [
  { href: "/account", label: "Account", icon: "account" },
  { href: "/support", label: "Support", icon: "support" },
];

const roleRoutes: Record<AppRole, SidebarItem[]> = {
  patient: [{ href: "/assistance", label: "Medication Help", icon: "support" }],
  provider: [{ href: "/ai-insights", label: "Provider Review", icon: "insights" }],
};

function isActivePath(currentPath: string, href: string) {
  return href === "/dashboard" ? currentPath === href : currentPath.startsWith(href);
}

function SidebarGlyph({
  icon,
  className,
}: {
  icon: SidebarIconName | "search" | "moon" | "bell" | "logout";
  className?: string;
}) {
  const iconClassName = cx("h-4 w-4", className);

  switch (icon) {
    case "dashboard":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <rect x="3.5" y="3.5" width="5" height="5" rx="1.2" />
          <rect x="11.5" y="3.5" width="5" height="5" rx="1.2" />
          <rect x="3.5" y="11.5" width="5" height="5" rx="1.2" />
          <rect x="11.5" y="11.5" width="5" height="5" rx="1.2" />
        </svg>
      );
    case "tasks":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <path d="M6 5.5h8" />
          <path d="M6 10h8" />
          <path d="M6 14.5h8" />
          <path d="M4 5.5h.01" />
          <path d="M4 10h.01" />
          <path d="M4 14.5h.01" />
        </svg>
      );
    case "adherence":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <path d="M10 16.5c3.3-2 5.5-4.5 5.5-7.7A3.3 3.3 0 0 0 10 6.7a3.3 3.3 0 0 0-5.5 2.1c0 3.2 2.2 5.7 5.5 7.7Z" />
          <path d="M8 10h4" />
          <path d="M10 8v4" />
        </svg>
      );
    case "reminders":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <path d="M10 3.5a3.5 3.5 0 0 0-3.5 3.5v1.3c0 .7-.2 1.4-.6 2L5 12h10l-.9-1.7c-.4-.6-.6-1.3-.6-2V7A3.5 3.5 0 0 0 10 3.5Z" />
          <path d="M8.3 14.5a1.9 1.9 0 0 0 3.4 0" />
        </svg>
      );
    case "messages":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <path d="M4 5.5h12v8H8.5L5 16v-2.5H4z" />
        </svg>
      );
    case "support":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <circle cx="10" cy="10" r="6.5" />
          <path d="M8.5 8a1.8 1.8 0 1 1 3 1.3c-.8.5-1.2.9-1.2 1.7" />
          <path d="M10 13.8h.01" />
        </svg>
      );
    case "account":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <circle cx="10" cy="7" r="2.8" />
          <path d="M4.8 16a5.6 5.6 0 0 1 10.4 0" />
        </svg>
      );
    case "insights":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <path d="M4.5 14.5V10" />
          <path d="M8.5 14.5V6" />
          <path d="M12.5 14.5V8" />
          <path d="M16.5 14.5V4" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <circle cx="9" cy="9" r="4.5" />
          <path d="m13 13 3 3" />
        </svg>
      );
    case "moon":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <path d="M12.8 3.8a6.4 6.4 0 1 0 3.4 11.8A6.8 6.8 0 0 1 12.8 3.8Z" />
        </svg>
      );
    case "bell":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <path d="M10 4a3 3 0 0 0-3 3v1.2c0 .7-.2 1.5-.6 2.1L5.5 12h9l-.9-1.7a4.2 4.2 0 0 1-.6-2.1V7a3 3 0 0 0-3-3Z" />
          <path d="M8.3 14.8a1.9 1.9 0 0 0 3.4 0" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClassName}>
          <path d="M8 4.5H5.5v11H8" />
          <path d="M11 7.5 14 10l-3 2.5" />
          <path d="M6 10h8" />
        </svg>
      );
    default:
      return null;
  }
}

function SidebarLink({
  currentPath,
  item,
}: {
  currentPath: string;
  item: SidebarItem;
}) {
  const isActive = isActivePath(currentPath, item.href);

  return (
    <Link
      href={item.href}
      className={cx(
        "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] text-slate-50 shadow-[0_18px_35px_-22px_rgba(59,130,246,0.95)] ring-1 ring-white/10"
          : "text-slate-400 hover:bg-white/6 hover:text-slate-100",
      )}
    >
      <span
        className={cx(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
          isActive
            ? "bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
            : "bg-transparent text-slate-500 group-hover:bg-white/6 group-hover:text-slate-200",
        )}
      >
        <SidebarGlyph icon={item.icon} />
      </span>
      <span
        className={cx(
          "tracking-[-0.01em] transition-colors duration-200",
          isActive ? "font-semibold text-white" : "font-medium text-slate-400 group-hover:text-slate-100",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

function MobileRouteStrip({
  currentPath,
  items,
}: {
  currentPath: string;
  items: SidebarItem[];
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex gap-2 overflow-x-auto">
        {items.map((item) => {
          const isActive = isActivePath(currentPath, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200",
                isActive
                  ? "border-transparent bg-[linear-gradient(135deg,#4f86ff,#2f6cf0)] text-white shadow-[0_14px_28px_-18px_rgba(59,130,246,0.8)]"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white",
              )}
            >
              <SidebarGlyph icon={item.icon} className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export async function PostLoginShell({ currentPath, children }: PostLoginShellProps) {
  const context = await requireAuthContext();
  const firstName = context.fullName.split(" ")[0] ?? context.fullName;
  const profileLabel = context.patientProfileId
    ? `Patient ID: #${context.patientProfileId.slice(0, 6).toUpperCase()}`
    : `User ID: #${context.userId.slice(0, 6).toUpperCase()}`;
  const mobileRoutes = [...primaryRoutes, ...secondaryRoutes, ...roleRoutes[context.role]];

  return (
    <div className="min-h-screen bg-[#edf2f8] p-1.5 sm:p-2.5">
      <div className="flex min-h-[calc(100vh-0.75rem)] overflow-hidden rounded-[28px] border border-[#d8e0ef] bg-[#f4f7fb] shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] sm:min-h-[calc(100vh-1.25rem)]">
        <aside className="hidden w-[260px] shrink-0 flex-col bg-[linear-gradient(180deg,#111a30_0%,#0f172a_52%,#11182b_100%)] px-5 py-5 lg:flex">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-[0_12px_24px_-16px_rgba(37,99,235,0.85)]">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M10 4v12" />
                <path d="M4 10h12" />
                <rect x="3.5" y="3.5" width="13" height="13" rx="3" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold tracking-[-0.02em] text-white">MediConnect</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                {context.role === "provider" ? "Care workspace" : "Patient portal"}
              </p>
            </div>
          </Link>

          <nav className="mt-8 space-y-1">
            {primaryRoutes.map((item) => (
              <SidebarLink key={item.href} currentPath={currentPath} item={item} />
            ))}
          </nav>

          <div className="mt-6 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Settings
          </div>

          <nav className="mt-2 space-y-1">
            {secondaryRoutes.map((item) => (
              <SidebarLink key={item.href} currentPath={currentPath} item={item} />
            ))}
            {roleRoutes[context.role].map((item) => (
              <SidebarLink key={item.href} currentPath={currentPath} item={item} />
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-800 pt-4">
            <SignOutButton className="w-full justify-start gap-3 border-slate-800 bg-transparent px-3 text-slate-400 shadow-none hover:bg-slate-800 hover:text-white">
              <SidebarGlyph icon="logout" />
              <span>Sign Out</span>
            </SignOutButton>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex min-w-[240px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                <SidebarGlyph icon="search" className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search health records, doctors..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Toggle theme"
                >
                  <SidebarGlyph icon="moon" className="h-4 w-4" />
                </button> */}
                <button
                  type="button"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Notifications"
                >
                  <SidebarGlyph icon="bell" className="h-4 w-4" />
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ef4444]" />
                </button>
                <div className="hidden h-10 w-px bg-slate-200 sm:block" />
                <div className="flex items-center gap-3 rounded-full pl-1 sm:pl-0">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-slate-900">{context.fullName}</p>
                    <p className="text-xs text-slate-500">{profileLabel}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fde68a,#f59e0b)] text-sm font-semibold text-slate-900">
                    {firstName.slice(0, 1).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <MobileRouteStrip currentPath={currentPath} items={mobileRoutes} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
