import { QueueAdapter } from './adapter';
import { StubQueueAdapter } from './stub-adapter';
import { BullMQAdapter } from './bullmq-adapter';

export function createQueueAdapter(): QueueAdapter {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    return new BullMQAdapter(redisUrl);
  }
  console.log('[Queue] No REDIS_URL found, using stub adapter');
  return new StubQueueAdapter();
}

export * from './adapter';
export * from './stub-adapter';
export * from './bullmq-adapter';
