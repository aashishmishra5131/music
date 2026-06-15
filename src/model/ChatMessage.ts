import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage extends Document {
  conversationId: string;
  userId?: string;
  username: string;
  userEmail?: string;
  sender: "user" | "admin";
  text: string;
  isRead: boolean;
}

const ChatMessageSchema: Schema<IChatMessage> = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    userId: { type: String },
    username: { type: String, required: true, default: "Guest" },
    userEmail: { type: String },
    sender: { type: String, enum: ["user", "admin"], required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChatMessageModel: Model<IChatMessage> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);

export default ChatMessageModel;
