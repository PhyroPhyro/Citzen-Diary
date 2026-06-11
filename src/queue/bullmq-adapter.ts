import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { QueueAdapter, JobData } from './adapter';

const CHARACTER_TICK_QUEUE = 'character-tick';
const WORLD_TICK_QUEUE = 'world-tick';

export class BullMQAdapter implements QueueAdapter {
  private characterTickQueue: Queue;
  private worldTickQueue: Queue;
  private worker: Worker | null = null;
  private queueEvents: QueueEvents | null = null;

  constructor(redisUrl: string) {
    const connection = {
      url: redisUrl,
    };

    this.characterTickQueue = new Queue(CHARACTER_TICK_QUEUE, { connection });
    this.worldTickQueue = new Queue(WORLD_TICK_QUEUE, { connection });
  }

  async connect(): Promise<void> {
    await this.characterTickQueue.waitUntilReady();
    await this.worldTickQueue.waitUntilReady();
    console.log('[Queue] BullMQ adapter connected');
  }

  async disconnect(): Promise<void> {
    await this.characterTickQueue.close();
    await this.worldTickQueue.close();
    if (this.worker) {
      await this.worker.close();
    }
    if (this.queueEvents) {
      await this.queueEvents.close();
    }
    console.log('[Queue] BullMQ adapter disconnected');
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.characterTickQueue.getJobCounts();
      return true;
    } catch {
      return false;
    }
  }

  async enqueueCharacterTick(characterId: string, delayMs?: number): Promise<void> {
    await this.characterTickQueue.add(
      'character_tick',
      { characterId } as JobData,
      {
        delay: delayMs,
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  }

  async enqueueWorldTick(): Promise<void> {
    await this.worldTickQueue.add(
      'world_tick',
      {} as JobData,
      {
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  }

  async scheduleNextTick(characterId: string, nextTickAt: Date): Promise<void> {
    const delay = nextTickAt.getTime() - Date.now();
    await this.enqueueCharacterTick(characterId, Math.max(0, delay));
  }

  async cancelPendingTicks(characterId: string): Promise<void> {
    const jobs = await this.characterTickQueue.getJobs(['delayed', 'waiting']);
    for (const job of jobs) {
      if (job.data?.characterId === characterId) {
        await job.remove();
      }
    }
  }

  createWorker(
    processFn: (job: Job<JobData>) => Promise<void>
  ): Worker {
    this.worker = new Worker(
      CHARACTER_TICK_QUEUE,
      async (job: Job<JobData>) => {
        await processFn(job);
      },
      {
        connection: { url: (this.characterTickQueue as any).opts.connection },
        concurrency: 5,
      }
    );

    this.queueEvents = new QueueEvents(CHARACTER_TICK_QUEUE, {
      connection: { url: (this.characterTickQueue as any).opts.connection },
    });

    this.worker.on('completed', (job: Job) => {
      console.log(`[Queue] Job ${job.id} completed`);
    });

    this.worker.on('failed', (job: Job | undefined, err: Error) => {
      console.error(`[Queue] Job ${job?.id} failed:`, err.message);
    });

    return this.worker;
  }
}
