import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import dbConnect from "@/lib/db.Connect";
import UserModel from "@/model/User";
import CourseModel from "@/model/Course";
import ChatMessageModel from "@/model/ChatMessage";
import OrderModel from "@/model/Order";

export async function GET() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const [totalUsers, totalCourses, totalMessages, unreadMessages, publishedCourses, revenueData, totalOrders] =
      await Promise.all([
        UserModel.countDocuments({ isVerified: true }),
        CourseModel.countDocuments(),
        ChatMessageModel.countDocuments({ sender: "user" }),
        ChatMessageModel.countDocuments({ sender: "user", isRead: false }),
        CourseModel.countDocuments({ isPublished: true }),
        OrderModel.aggregate([
          { $match: { status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        OrderModel.countDocuments({ status: "paid" }),
      ]);

    const totalRevenue = revenueData[0]?.total || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalMessages,
        unreadMessages,
        publishedCourses,
        totalRevenue,
        totalOrders,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching stats" }, { status: 500 });
  }
}
