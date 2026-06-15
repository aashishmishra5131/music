import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db.Connect";
import CourseModel from "@/model/Course";
import OrderModel from "@/model/Order";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Please login to purchase courses" }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ success: false, message: "Course ID is required" }, { status: 400 });
    }

    await dbConnect();

    const course = await CourseModel.findById(courseId);
    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }
    if (!course.isPublished) {
      return NextResponse.json({ success: false, message: "Course is not available" }, { status: 400 });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(course.price * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: (session.user as any)._id,
        courseName: course.title,
      },
    });

    // Save order in DB
    const order = await OrderModel.create({
      userId: (session.user as any)._id,
      courseId: course._id,
      courseTitle: course.title,
      courseSlug: course.slug,
      courseImage: course.image,
      amount: amountInPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      status: "created",
      username: session.user.name || "user",
      userEmail: session.user.email || "",
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      courseTitle: course.title,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
