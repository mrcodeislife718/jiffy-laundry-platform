import { createClient } from 'redis';
import { env } from './env';

let redis: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!redis) {
    redis = createClient({
      url: env.redisUrl,
    });

    redis.on('error', (err) => {
      console.error('Redis error:', err);
    });

    redis.on('connect', () => {
      console.log('Redis connected');
    });

    await redis.connect();
  }

  return redis;
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
