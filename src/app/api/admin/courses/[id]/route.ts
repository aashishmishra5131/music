import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import dbConnect from "@/lib/db.Connect";
import CourseModel from "@/model/Course";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await dbConnect();
  try {
    const body = await request.json();
    const course = await CourseModel.findByIdAndUpdate(params.id, body, { new: true });
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    return NextResponse.json({ success: true, course }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await dbConnect();
  try {
    await CourseModel.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Course deleted" }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Error deleting course" }, { status: 500 });
  }
}
