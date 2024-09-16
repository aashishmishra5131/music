import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/sign-in", "/sign-up", "/", "/verify/:path*"], // Adjust the matcher as needed
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  if (
    token &&
    (url.pathname === "/sign-in" ||
      url.pathname === "/sign-up" )
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && url.pathname === "/") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}
