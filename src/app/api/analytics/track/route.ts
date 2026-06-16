import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db.Connect';
import VisitorModel from '@/model/Visitor';

export async function POST(req: NextRequest) {
  try {
    const { visitorId, path } = await req.json();
    if (!visitorId || !path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await dbConnect();

    // Normalize to start of today (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Find or create today's record
    let record = await VisitorModel.findOne({ date: today });

    if (record) {
      // Increment total page views
      record.pageViews += 1;

      // Check if this visitor is new today
      if (!record.visitorIds.includes(visitorId)) {
        record.visitorIds.push(visitorId);
        record.uniqueVisitors += 1;
      }

      // Update page breakdown
      const pageEntry = record.pageBreakdown.find((p: { path: string }) => p.path === path);
      if (pageEntry) {
        pageEntry.views += 1;
      } else {
        record.pageBreakdown.push({ path, views: 1 });
      }

      await record.save();
    } else {
      // First visit of the day
      await VisitorModel.create({
        date: today,
        pageViews: 1,
        uniqueVisitors: 1,
        visitorIds: [visitorId],
        pageBreakdown: [{ path, views: 1 }],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Silent fail — never break user experience for analytics
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
