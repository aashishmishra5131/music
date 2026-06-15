import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({
      message: "Logout Successfully",
      success: true,
    });
    // Clear NextAuth session cookie
    response.cookies.set("next-auth.session-token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    response.cookies.set("__Secure-next-auth.session-token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}