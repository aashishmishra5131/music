import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db.Connect";
import CourseModel from "@/model/Course";
import UserModel from "@/model/User";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    await dbConnect();

    const course = await CourseModel.findOne({ slug, isPublished: true }).lean();
    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }

    // Check if user has purchased this course
    let isPurchased = false;
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const user = await UserModel.findById((session.user as any)._id).select("purchasedCourses").lean();
      if (user && user.purchasedCourses) {
        isPurchased = user.purchasedCourses.some(
          (id: any) => id.toString() === (course as any)._id.toString()
        );
      }
    }

    return NextResponse.json({ success: true, course, isPurchased });
  } catch (error: any) {
    console.error("Course fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch course" },
      { status: 500 }
    );
  }
}
