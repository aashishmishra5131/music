import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db.Connect";
import CourseModel from "@/model/Course";
import OrderModel from "@/model/Order";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { emitAdminStats } from "@/lib/sseManager";
import { publishEvent } from "@/lib/sns";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Please login first" }, { status: 401 });
    }

    const { courseId, courseTitle, courseSlug, courseImage, price } = await req.json();
    if (!courseTitle || price === undefined) {
      return NextResponse.json({ success: false, message: "Missing course info" }, { status: 400 });
    }

    await dbConnect();
    const userId = (session.user as any)._id;

    // Resolve real courseId from DB
    let resolvedCourseId: mongoose.Types.ObjectId | null = null;
    let resolvedCourse: any = null;

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      resolvedCourse = await CourseModel.findById(courseId).lean();
      if (resolvedCourse) resolvedCourseId = (resolvedCourse as any)._id;
    }
    if (!resolvedCourseId && courseSlug) {
      resolvedCourse = await CourseModel.findOne({ slug: courseSlug }).lean();
      if (resolvedCourse) resolvedCourseId = (resolvedCourse as any)._id;
    }
    if (!resolvedCourseId && courseTitle) {
      resolvedCourse = await CourseModel.findOne({ title: { $regex: new RegExp(`^${courseTitle}$`, "i") } }).lean();
      if (resolvedCourse) resolvedCourseId = (resolvedCourse as any)._id;
    }
    // Auto-create if not found
    if (!resolvedCourseId) {
      const newCourse = await CourseModel.create({
        title: courseTitle,
        slug: courseSlug || courseTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, ""),
        description: `${courseTitle} - Comprehensive music course`,
        price: Number(price),
        instructor: "MusicNext Instructor",
        image: courseImage || "",
        level: "Beginner",
        category: "Music",
        duration: "Self-paced",
        isFeatured: false,
        isPublished: true,
      });
      resolvedCourseId = newCourse._id as mongoose.Types.ObjectId;
      resolvedCourse = newCourse;
    }

    // Check already purchased
    const user = await UserModel.findById(userId).select("purchasedCourses").lean();
    if (user?.purchasedCourses?.some((id: any) => id.toString() === resolvedCourseId!.toString())) {
      return NextResponse.json({ success: false, message: "You are already enrolled in this course!" }, { status: 400 });
    }

    const mockOrderId = `mock_order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const mockPaymentId = `mock_pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Save Order
    const order = await OrderModel.create({
      userId,
      courseId: resolvedCourseId,
      courseTitle,
      courseSlug: (resolvedCourse as any)?.slug || courseSlug || courseTitle.toLowerCase().replace(/\s+/g, "-"),
      courseImage: (resolvedCourse as any)?.image || courseImage || "",
      amount: Math.round(Number(price) * 100),
      currency: "INR",
      razorpayOrderId: mockOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: "mock_verified",
      status: "paid",
      username: (session.user as any).username || session.user.name || "user",
      userEmail: session.user.email || "",
    });

    // Allot course to user
    await UserModel.findByIdAndUpdate(userId, { $addToSet: { purchasedCourses: resolvedCourseId } });

    // Emit real-time stats update to admin dashboard & orders page
    try {
      const [ordersAgg, totalUsers] = await Promise.all([
        OrderModel.aggregate([
          { $match: { status: "paid" } },
          { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$amount" } } },
        ]),
        UserModel.countDocuments(),
      ]);
      const paidStats = ordersAgg[0] || { count: 0, revenue: 0 };
      emitAdminStats("new_order", {
        order: {
          _id: order._id,
          username: (session.user as any).username || session.user.name || "user",
          userEmail: session.user.email || "",
          courseTitle,
          courseSlug: (resolvedCourse as any)?.slug || courseSlug || "",
          amount: order.amount,
          currency: "INR",
          razorpayOrderId: mockOrderId,
          razorpayPaymentId: mockPaymentId,
          status: "paid",
          createdAt: new Date().toISOString(),
        },
        stats: {
          totalOrders: paidStats.count,
          totalRevenue: paidStats.revenue,
          totalUsers,
        },
      });
    } catch {
      // SSE emit failure must never block the payment response
    }

    // Publish ORDER_PLACED event to SNS (non-blocking)
    publishEvent('ORDER_PLACED', {
      userId: userId?.toString(),
      email: session.user.email || '',
      username: (session.user as any).username || session.user.name || '',
      courseTitle,
      courseId: resolvedCourseId?.toString(),
      price: Number(price),
      orderId: (order as any)._id?.toString(),
      razorpayOrderId: mockOrderId,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Payment successful! Course allotted.",
      orderId: mockOrderId,
      paymentId: mockPaymentId,
      courseTitle,
      amount: Math.round(Number(price) * 100),
    });
  } catch (error: any) {
    console.error("Mock payment error:", error);
    return NextResponse.json({ success: false, message: error.message || "Payment failed" }, { status: 500 });
  }
}
