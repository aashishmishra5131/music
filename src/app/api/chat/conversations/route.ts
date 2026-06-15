import dbConnect from "@/lib/db.Connect";
import ChatMessageModel from "@/model/ChatMessage";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const conversations = await ChatMessageModel.aggregate([
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$conversationId",
          username: { $first: "$username" },
          userEmail: { $first: "$userEmail" },
          lastMessage: { $last: "$text" },
          lastMessageAt: { $last: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$sender", "user"] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    return NextResponse.json({ success: true, conversations }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching conversations" },
      { status: 500 }
    );
  }
}
