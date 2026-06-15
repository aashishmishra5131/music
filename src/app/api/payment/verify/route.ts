import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db.Connect";
import OrderModel from "@/model/Order";
import UserModel from "@/model/User";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ success: false, message: "Missing payment details" }, { status: 400 });
    }

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      // Mark order as failed
      await dbConnect();
      await OrderModel.findOneAndUpdate(
        { razorpayOrderId },
        { status: "failed" }
      );
      return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 });
    }

    await dbConnect();

    // Update order status to paid
    const order = await OrderModel.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: "paid",
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Add courseId to user's purchasedCourses
    await UserModel.findByIdAndUpdate(
      (session.user as any)._id,
      { $addToSet: { purchasedCourses: order.courseId } }
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully! You are now enrolled.",
      courseSlug: order.courseSlug,
      courseTitle: order.courseTitle,
    });
  } catch (error: any) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
