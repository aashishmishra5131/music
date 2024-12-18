import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/login", "/signup", "/", "/verify/:path*"], // Adjust the matcher as needed
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  if (
    token &&
    (url.pathname === "/login" ||
      url.pathname === "/signup" )
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && url.pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}
