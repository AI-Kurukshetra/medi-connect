import Link from "next/link";
import { appTheme } from "@/theme";

export function MarketingFooter() {
  return (
    <footer className="mt-8 border-t border-slate-200 py-6">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
        <p className="text-xs text-slate-400">© 2026 {appTheme.brand.name}. All rights reserved.</p>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <Link href="/privacy" className="transition hover:text-slate-900">
            Privacy Policy
          </Link>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <Link href="/terms" className="transition hover:text-slate-900">
            Terms of Service
          </Link>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <Link href="/support" className="transition hover:text-slate-900">
            Help Center
          </Link>
        </div>
      </div>
    </footer>
  );
}
