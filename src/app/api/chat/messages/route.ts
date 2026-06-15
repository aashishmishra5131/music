import dbConnect from "@/lib/db.Connect";
import ChatMessageModel from "@/model/ChatMessage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: "conversationId required" },
        { status: 400 }
      );
    }

    const messages = await ChatMessageModel.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching messages" },
      { status: 500 }
    );
  }
}
