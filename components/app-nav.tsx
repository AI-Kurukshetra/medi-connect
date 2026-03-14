import Image from "next/image";
import Link from "next/link";
import { appTheme, cx, themeClassNames } from "@/theme";

const marketingLinks = [
  { href: "#story", label: "Story" },
  { href: "#roles", label: "Roles" },
  { href: "#workspace", label: "Workspace" },
  { href: "#launch", label: "Launch" },
] as const;

interface AppNavProps {
  currentPath: string;
}

export function AppNav({ currentPath }: AppNavProps) {
  return (
    <header className={themeClassNames.headerCard}>
      <Link href="/" className="flex items-center gap-3">
        <div className={themeClassNames.logoBadge}>
          <Image
            src="/logo.png"
            alt={`${appTheme.brand.name} logo`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-[18px] object-cover"
            priority
          />
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
          {marketingLinks.map((link) => (
            <Link key={link.href} href={link.href} className={themeClassNames.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap gap-2 sm:items-center lg:justify-end">
          <div className={themeClassNames.chip}>Hackathon-ready MVP</div>
          <Link
            href="/sign-in"
            className={
              currentPath === "/sign-in"
                ? themeClassNames.navLinkActive
                : themeClassNames.navLink
            }
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={
              currentPath === "/sign-up"
                ? themeClassNames.navLinkActive
                : themeClassNames.navLink
            }
          >
            Create account
          </Link>
        </div>
      </div>
    </header>
  );
}
