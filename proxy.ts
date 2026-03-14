import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";

const protectedMatchers = [
  "/dashboard",
  "/tasks",
  "/adherence",
  "/reminders",
  "/messages",
  "/account",
  "/support",
  "/prior-auth",
  "/ehr",
  "/operations",
  "/assistance",
  "/documents",
  "/billing",
  "/emergency",
  "/ai-insights",
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedMatchers.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/adherence/:path*",
    "/reminders/:path*",
    "/messages/:path*",
    "/account/:path*",
    "/support/:path*",
    "/prior-auth/:path*",
    "/ehr/:path*",
    "/operations/:path*",
    "/assistance/:path*",
    "/documents/:path*",
    "/billing/:path*",
    "/emergency/:path*",
    "/ai-insights/:path*",
  ],
};
