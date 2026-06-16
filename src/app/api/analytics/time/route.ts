import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db.Connect';
import VisitorModel from '@/model/Visitor';

export async function POST(req: NextRequest) {
  try {
    const { visitorId, seconds } = await req.json();

    // Basic validation — reject impossible values
    if (!visitorId || typeof seconds !== 'number' || seconds < 3 || seconds > 86400) {
      return NextResponse.json({ ok: false });
    }

    await dbConnect();

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Increment totalTimeSeconds and sessionCount for today
    // upsert: true creates the document if it doesn't exist yet
    await VisitorModel.findOneAndUpdate(
      { date: today },
      { $inc: { totalTimeSeconds: seconds, sessionCount: 1 } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch {
    // Silent fail — never break user experience
    return NextResponse.json({ ok: false });
  }
}
