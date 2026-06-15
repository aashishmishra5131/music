import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  instructor: string;
  image: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  duration: string;
  isFeatured: boolean;
  isPublished: boolean;
}

const CourseSchema: Schema<ICourse> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    instructor: { type: String, required: true },
    image: { type: String, default: "" },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    category: { type: String, default: "Music" },
    duration: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CourseModel: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default CourseModel;
