import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";

/**
 * Cartridge-CMS Proxy (Next.js 16 — formerly middleware)
 *
 * Flow:
 *  1. /setup paths → always allowed (setup wizard itself)
 *  2. /api/* paths → always allowed (API routes handle their own auth)
 *  3. /admin/* → check installed cookie, then check auth
 *  4. Everything else → check installed cookie
 *
 * NOTE: We use a cookie-based approach instead of fetching the API to
 * avoid infinite loops and edge runtime DB access issues. The setup
 * wizard sets the "cartridge_installed" cookie on completion.
 */
export default auth(async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow: setup, NextAuth API, static assets
  if (
    pathname.startsWith("/setup") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // Check installed via cookie (set by setup wizard on completion)
  const installed = req.cookies.get("cartridge_installed")?.value === "true";

  if (!installed) {
    return NextResponse.redirect(new URL("/setup", req.url));
  }

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const session = (req as any).auth;
    if (!session?.user) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
