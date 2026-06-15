import { NextResponse } from "next/server";

function isRealKey(val: string | undefined): boolean {
  return !!val && !val.startsWith("your_") && val.length > 8;
}

export async function GET() {
  return NextResponse.json({
    github: isRealKey(process.env.GITHUB_CLIENT_ID) && isRealKey(process.env.GITHUB_CLIENT_SECRET),
    google: isRealKey(process.env.GOOGLE_CLIENT_ID) && isRealKey(process.env.GOOGLE_CLIENT_SECRET),
  });
}
