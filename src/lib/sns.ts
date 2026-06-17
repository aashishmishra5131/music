/**
 * SNS Publisher — musicnext-events topic pe events publish karo.
 *
 * Events:
 *  - USER_REGISTERED  { userId, email, username }
 *  - ORDER_PLACED     { userId, email, courseTitle, price, orderId }
 *  - COURSE_ENROLLED  { userId, courseId, courseTitle }
 *
 * Usage:
 *   import { publishEvent } from '@/lib/sns';
 *   await publishEvent('ORDER_PLACED', { ... });
 */

import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { awsConfig, isAWSConfigured } from './aws';

let snsClient: SNSClient | null = null;

function getSNSClient(): SNSClient {
  if (!snsClient) {
    snsClient = new SNSClient(awsConfig);
  }
  return snsClient;
}

export type SNSEventType =
  | 'USER_REGISTERED'
  | 'ORDER_PLACED'
  | 'COURSE_ENROLLED'
  | 'ADMIN_NOTIFICATION';

export interface SNSEventPayload {
  eventType: SNSEventType;
  timestamp: string;
  [key: string]: any;
}

/**
 * Publish an event to SNS topic.
 * Silently skips if AWS is not configured (dev environment).
 */
export async function publishEvent(
  eventType: SNSEventType,
  data: Record<string, any>
): Promise<void> {
  if (!isAWSConfigured()) {
    console.log(`[SNS] Skipped (not configured): ${eventType}`, data);
    return;
  }

  const topicArn = process.env.AWS_SNS_TOPIC_ARN;
  if (!topicArn || topicArn.startsWith('your_')) {
    console.log(`[SNS] Skipped (no topic ARN): ${eventType}`);
    return;
  }

  try {
    const payload: SNSEventPayload = {
      eventType,
      timestamp: new Date().toISOString(),
      ...data,
    };

    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(payload),
      Subject: `MusicNext: ${eventType}`,
      // MessageAttributes allow SQS subscriptions to filter by eventType
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: eventType,
        },
      },
    });

    const result = await getSNSClient().send(command);
    console.log(`[SNS] Published ${eventType} → MessageId: ${result.MessageId}`);
  } catch (error) {
    // Never break the main flow for analytics
    console.error(`[SNS] Failed to publish ${eventType}:`, error);
  }
}
