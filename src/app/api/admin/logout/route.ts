import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

export async function GET() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return response;
}
