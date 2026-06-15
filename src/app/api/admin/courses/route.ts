import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import dbConnect from "@/lib/db.Connect";
import CourseModel from "@/model/Course";

export async function GET() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await dbConnect();
  try {
    const courses = await CourseModel.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, courses }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Error fetching courses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await dbConnect();
  try {
    const body = await request.json();

    // Auto-generate slug from title if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }

    // Check slug uniqueness
    const existing = await CourseModel.findOne({ slug: body.slug });
    if (existing) {
      body.slug = `${body.slug}-${Date.now()}`;
    }

    const course = await CourseModel.create(body);
    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Error creating course" }, { status: 500 });
  }
}
