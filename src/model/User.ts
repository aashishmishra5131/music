import mongoose, { Schema, Document, Model } from "mongoose";

// Define the Message interface
export interface IMessage extends Document {
  content: string;
  createdAt: Date;
}

// Define the Message schema
const MessageSchema: Schema<IMessage> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Define the User interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: IMessage[];
  purchasedCourses: mongoose.Types.ObjectId[];
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+\@.+\..+/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: false,
    default: "",
  },
  verifyCode: {
    type: String,
    required: false,
    default: "000000",
  },
  verifyCodeExpiry: {
    type: Date,
    required: false,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
  purchasedCourses: [
    { type: Schema.Types.ObjectId, ref: "Course" }
  ],
}, { timestamps: true });

// Export the User model
const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
