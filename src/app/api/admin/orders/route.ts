import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import dbConnect from "@/lib/db.Connect";
import OrderModel from "@/model/Order";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const status = url.searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;

    const [orders, total, stats] = await Promise.all([
      OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(filter),
      OrderModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    // Build stats summary
    const summary = { totalRevenue: 0, totalOrders: 0, paidOrders: 0, pendingOrders: 0, failedOrders: 0 };
    stats.forEach((s: any) => {
      summary.totalOrders += s.count;
      if (s._id === "paid") {
        summary.paidOrders = s.count;
        summary.totalRevenue = s.totalAmount; // in paise
      } else if (s._id === "created") {
        summary.pendingOrders = s.count;
      } else if (s._id === "failed") {
        summary.failedOrders = s.count;
      }
    });

    return NextResponse.json({
      success: true,
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary,
    });
  } catch (error: any) {
    console.error("Admin orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
