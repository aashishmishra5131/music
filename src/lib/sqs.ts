/**
 * SQS Consumer helper — MusicNext queue se messages receive + delete karo.
 *
 * Queue: musicnext-notifications
 *
 * Used by: /api/workers/sqs-consumer (cron job or manual trigger)
 */

import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
} from '@aws-sdk/client-sqs';
import { awsConfig, isAWSConfigured } from './aws';

let sqsClient: SQSClient | null = null;

function getSQSClient(): SQSClient {
  if (!sqsClient) {
    sqsClient = new SQSClient(awsConfig);
  }
  return sqsClient;
}

export interface SQSMessage {
  messageId: string;
  receiptHandle: string;
  body: Record<string, any>;
}

/**
 * Poll SQS queue for up to `maxMessages` (1-10).
 * Returns parsed message objects.
 */
export async function receiveMessages(maxMessages = 5): Promise<SQSMessage[]> {
  if (!isAWSConfigured()) return [];

  const queueUrl = process.env.AWS_SQS_QUEUE_URL;
  if (!queueUrl || queueUrl.startsWith('your_')) return [];

  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: 5,        // long-polling — reduces empty responses
      VisibilityTimeout: 30,     // 30s to process before it re-appears
    });

    const response = await getSQSClient().send(command);
    const raw = response.Messages || [];

    return raw.map((msg) => ({
      messageId: msg.MessageId || '',
      receiptHandle: msg.ReceiptHandle || '',
      body: (() => {
        try {
          const outer = JSON.parse(msg.Body || '{}');
          // SNS wraps payload in outer.Message
          const inner = outer.Message ? JSON.parse(outer.Message) : outer;
          return inner;
        } catch {
          return {};
        }
      })(),
    }));
  } catch (error) {
    console.error('[SQS] Failed to receive messages:', error);
    return [];
  }
}

/**
 * Delete a processed message from the queue.
 * Always call this after successfully handling a message.
 */
export async function deleteMessage(receiptHandle: string): Promise<void> {
  if (!isAWSConfigured()) return;

  const queueUrl = process.env.AWS_SQS_QUEUE_URL;
  if (!queueUrl || queueUrl.startsWith('your_')) return;

  try {
    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    });
    await getSQSClient().send(command);
  } catch (error) {
    console.error('[SQS] Failed to delete message:', error);
  }
}

/**
 * Get approximate queue depth (how many messages are waiting).
 */
export async function getQueueDepth(): Promise<number> {
  if (!isAWSConfigured()) return 0;

  const queueUrl = process.env.AWS_SQS_QUEUE_URL;
  if (!queueUrl || queueUrl.startsWith('your_')) return 0;

  try {
    const command = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['ApproximateNumberOfMessages'],
    });
    const res = await getSQSClient().send(command);
    return parseInt(res.Attributes?.ApproximateNumberOfMessages || '0', 10);
  } catch {
    return 0;
  }
}
