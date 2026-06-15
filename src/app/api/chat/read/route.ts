import dbConnect from "@/lib/db.Connect";
import ChatMessageModel from "@/model/ChatMessage";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  await dbConnect();
  try {
    const { conversationId, sender } = await request.json();

    if (!conversationId || !sender) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    await ChatMessageModel.updateMany(
      { conversationId, sender, isRead: false },
      { isRead: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error marking as read" },
      { status: 500 }
    );
  }
}
