/**
 * SQS Consumer Worker
 * POST /api/workers/sqs-consumer
 *
 * Isko call karo:
 *   - Cron job se (e.g. Vercel Cron every 1 min)
 *   - Ya manually trigger karo admin panel se
 *
 * Har message mein eventType hota hai:
 *   USER_REGISTERED  → welcome email bhejo
 *   ORDER_PLACED     → order confirmation email + admin alert
 *   COURSE_ENROLLED  → enrollment confirmation
 *
 * Protected by WORKER_SECRET header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { receiveMessages, deleteMessage, getQueueDepth } from '@/lib/sqs';

// Processors — har event type ka handler
async function handleUserRegistered(body: Record<string, any>) {
  const { email, username } = body;
  console.log(`[Worker] USER_REGISTERED → ${email} (${username})`);

  // TODO: Send welcome email via Resend
  // import resend from '@/lib/resend';
  // await resend.emails.send({ to: email, subject: 'Welcome!', html: '...' });
}

async function handleOrderPlaced(body: Record<string, any>) {
  const { email, courseTitle, price, orderId } = body;
  console.log(`[Worker] ORDER_PLACED → ${email} ordered "${courseTitle}" ₹${price}`);

  // TODO: Send order confirmation email
  // TODO: Send admin Slack/email notification
}

async function handleCourseEnrolled(body: Record<string, any>) {
  const { email, courseTitle } = body;
  console.log(`[Worker] COURSE_ENROLLED → ${email} enrolled in "${courseTitle}"`);

  // TODO: Send enrollment confirmation + access details
}

async function handleAdminNotification(body: Record<string, any>) {
  console.log(`[Worker] ADMIN_NOTIFICATION →`, body);
  // TODO: Push to admin dashboard, Slack, etc.
}

// Route handler
export async function POST(req: NextRequest) {
  // Protect with a secret so only cron jobs / trusted callers can trigger it
  const workerSecret = req.headers.get('x-worker-secret');
  if (workerSecret !== process.env.WORKER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const processed: string[] = [];
  const failed: string[] = [];

  try {
    const messages = await receiveMessages(10);

    if (messages.length === 0) {
      const depth = await getQueueDepth();
      return NextResponse.json({ ok: true, processed: 0, queueDepth: depth });
    }

    for (const msg of messages) {
      try {
        const { eventType } = msg.body;

        switch (eventType) {
          case 'USER_REGISTERED':
            await handleUserRegistered(msg.body);
            break;
          case 'ORDER_PLACED':
            await handleOrderPlaced(msg.body);
            break;
          case 'COURSE_ENROLLED':
            await handleCourseEnrolled(msg.body);
            break;
          case 'ADMIN_NOTIFICATION':
            await handleAdminNotification(msg.body);
            break;
          default:
            console.warn(`[Worker] Unknown eventType: ${eventType}`);
        }

        // Delete only after successful processing
        await deleteMessage(msg.receiptHandle);
        processed.push(msg.messageId);
      } catch (err) {
        console.error(`[Worker] Failed to process ${msg.messageId}:`, err);
        // Don't delete — message will become visible again after VisibilityTimeout
        failed.push(msg.messageId);
      }
    }

    return NextResponse.json({
      ok: true,
      processed: processed.length,
      failed: failed.length,
      processedIds: processed,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

// GET — check queue depth (admin dashboard use kar sakta hai)
export async function GET(req: NextRequest) {
  const workerSecret = req.headers.get('x-worker-secret');
  if (workerSecret !== process.env.WORKER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const depth = await getQueueDepth();
  return NextResponse.json({ queueDepth: depth });
}
