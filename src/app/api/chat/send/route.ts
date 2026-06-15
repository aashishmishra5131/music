import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db.Connect";
import ChatMessageModel from "@/model/ChatMessage";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { emitAdminChat, emitUserChat } from "@/lib/sseManager";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { conversationId, text, sender, username, userEmail } =
      await request.json();

    if (!conversationId || !text?.trim() || !sender) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Only admin can send admin messages
    if (sender === "admin") {
      const isAdmin = await isAdminAuthenticated();
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const message = await ChatMessageModel.create({
      conversationId,
      text: text.trim(),
      sender,
      username: username || "Guest",
      userEmail,
    });

    const msgData = {
      _id: message._id,
      conversationId,
      text: message.text,
      sender: message.sender,
      username: message.username,
      userEmail: message.userEmail,
      isRead: message.isRead,
      createdAt: (message as any).createdAt,
    };

    if (sender === "user") {
      // Push to every open admin chat tab instantly
      emitAdminChat("new_message", { message: msgData, conversationId });
    } else {
      // Admin replied — push to the user's SSE stream
      emitUserChat(conversationId, "new_message", { message: msgData });
      // Also ping admin tabs so sent-tick updates
      emitAdminChat("message_sent", { message: msgData, conversationId });
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("Chat send error:", error);
    return NextResponse.json(
      { success: false, message: "Error sending message" },
      { status: 500 }
    );
  }
}
