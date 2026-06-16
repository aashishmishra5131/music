import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import dbConnect from '@/lib/db.Connect';
import VisitorModel from '@/model/Visitor';

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = (cookieStore as any).get('admin_token')?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'fallback');
    await jose.jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30', 10);

  try {
    await dbConnect();

    // Date range: last N days
    const from = new Date();
    from.setUTCHours(0, 0, 0, 0);
    from.setDate(from.getDate() - (days - 1));

    const records = await VisitorModel.find(
      { date: { $gte: from } },
      { visitorIds: 0 } // exclude large array from response
    ).sort({ date: 1 });

    // Fill in missing days with zero values
    const filled = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      const dayStr = d.toISOString().split('T')[0];

      const found = records.find(
        (r) => r.date.toISOString().split('T')[0] === dayStr
      );
      filled.push(
        found
          ? {
              date: dayStr,
              pageViews: found.pageViews,
              uniqueVisitors: found.uniqueVisitors,
              pageBreakdown: found.pageBreakdown,
              totalTimeSeconds: found.totalTimeSeconds || 0,
              sessionCount: found.sessionCount || 0,
            }
          : { date: dayStr, pageViews: 0, uniqueVisitors: 0, pageBreakdown: [], totalTimeSeconds: 0, sessionCount: 0 }
      );
    }

    // Aggregate top pages across all days
    const pageMap: Record<string, number> = {};
    records.forEach((r) => {
      r.pageBreakdown.forEach((p: { path: string; views: number }) => {
        pageMap[p.path] = (pageMap[p.path] || 0) + p.views;
      });
    });
    const topPages = Object.entries(pageMap)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Summary
    const totalPageViews = records.reduce((s, r) => s + r.pageViews, 0);
    const totalUniqueVisitors = records.reduce((s, r) => s + r.uniqueVisitors, 0);
    const periodTotalTimeSeconds = records.reduce((s, r) => s + (r.totalTimeSeconds || 0), 0);
    const periodSessionCount = records.reduce((s, r) => s + (r.sessionCount || 0), 0);
    const today = filled[filled.length - 1];

    return NextResponse.json({
      days: filled,
      topPages,
      summary: {
        totalPageViews,
        totalUniqueVisitors,
        todayPageViews: today?.pageViews ?? 0,
        todayUniqueVisitors: today?.uniqueVisitors ?? 0,
        todayTotalTimeSeconds: today?.totalTimeSeconds ?? 0,
        todaySessionCount: today?.sessionCount ?? 0,
        periodTotalTimeSeconds,
        periodSessionCount,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
