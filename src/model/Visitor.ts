import mongoose, { Schema, Document } from 'mongoose';

export interface IPageBreakdown {
  path: string;
  views: number;
}

export interface IVisitor extends Document {
  date: Date;
  pageViews: number;
  uniqueVisitors: number;
  visitorIds: string[];
  pageBreakdown: IPageBreakdown[];
  totalTimeSeconds: number;  // sum of all session durations today
  sessionCount: number;      // number of sessions that sent time data
}

const PageBreakdownSchema = new Schema<IPageBreakdown>({
  path: { type: String, required: true },
  views: { type: Number, default: 0 },
});

const VisitorSchema = new Schema<IVisitor>({
  date: { type: Date, required: true, unique: true },
  pageViews: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  visitorIds: [{ type: String }],
  pageBreakdown: [PageBreakdownSchema],
  totalTimeSeconds: { type: Number, default: 0 },
  sessionCount: { type: Number, default: 0 },
});

// Index for fast date-range queries
VisitorSchema.index({ date: -1 });

const VisitorModel =
  mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema);

export default VisitorModel;
