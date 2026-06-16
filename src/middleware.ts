import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAdminAuthenticatedFromRequest } from "@/lib/adminAuth";

export const config = {
  matcher: ["/login", "/signup", "/", "/verify/:path*", "/profile", "/my-courses", "/admin/:path*"],
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // ── Admin routes: use separate admin_token cookie ──
  if (url.pathname.startsWith("/admin")) {
    // Login page is always accessible
    if (url.pathname === "/admin/login") {
      return NextResponse.next();
    }
    // All other admin routes require admin token
    const isAdmin = await isAdminAuthenticatedFromRequest(request);
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── User routes: use NextAuth token ──
  const token = await getToken({ req: request });

  if (
    token &&
    (url.pathname === "/login" || url.pathname === "/signup")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && url.pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!token && url.pathname === "/profile") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!token && url.pathname === "/my-courses") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
