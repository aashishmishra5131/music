import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  courseTitle: string;
  courseSlug: string;
  courseImage: string;
  amount: number; // in paise (INR * 100)
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: "created" | "paid" | "failed";
  username: string;
  userEmail: string;
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    courseTitle: { type: String, required: true },
    courseSlug: { type: String, required: true },
    courseImage: { type: String, default: "" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    username: { type: String, required: true },
    userEmail: { type: String, required: true },
  },
  { timestamps: true }
);

const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
