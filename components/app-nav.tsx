import Link from "next/link";
import { appTheme, cx, themeClassNames } from "@/theme";

const links = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/adherence", label: "Adherence" },
  { href: "/reminders", label: "Reminders" },
  { href: "/messages", label: "Messages" },
  { href: "/account", label: "Account" },
  { href: "/support", label: "Support" },
];

const authLinks = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create account" },
];

interface AppNavProps {
  currentPath: string;
}

export function AppNav({ currentPath }: AppNavProps) {
  return (
    <header className={themeClassNames.headerCard}>
      <Link href="/" className="flex items-center gap-3">
        <div className={themeClassNames.logoBadge}>
          {appTheme.brand.monogram}
        </div>
        <div>
          <p className={themeClassNames.text.eyebrow}>{appTheme.brand.name}</p>
          <p className={cx("text-sm", themeClassNames.text.body)}>
            {appTheme.brand.tagline}
          </p>
        </div>
      </Link>
      <div className="flex flex-col gap-3 lg:items-end">
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? currentPath === link.href
                : currentPath.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? themeClassNames.navLinkActive : themeClassNames.navLink}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-wrap gap-2 sm:items-center lg:justify-end">
          <div className={themeClassNames.chip}>
            Mock data demo
          </div>
          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                currentPath === link.href
                  ? themeClassNames.navLinkActive
                  : themeClassNames.navLink
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
