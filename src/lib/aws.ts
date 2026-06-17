/**
 * Shared AWS credentials config.
 * All AWS SDK clients (SNS, SQS) import from here.
 */
export const awsConfig = {
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

/** Returns true only if real AWS keys are configured */
export function isAWSConfigured(): boolean {
  return (
    !!process.env.AWS_ACCESS_KEY_ID &&
    !!process.env.AWS_SECRET_ACCESS_KEY &&
    !process.env.AWS_ACCESS_KEY_ID.startsWith('your_') &&
    !process.env.AWS_SECRET_ACCESS_KEY.startsWith('your_')
  );
}
