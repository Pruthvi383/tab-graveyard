import { Redis } from "@upstash/redis";

let redisInstance: Redis | null | undefined;

export function getRedis() {
  if (redisInstance !== undefined) {
    return redisInstance;
  }

  try {
    redisInstance = Redis.fromEnv();
  } catch {
    redisInstance = null;
  }

  return redisInstance;
}

export async function readCache<T>(key: string) {
  const redis = getRedis();

  if (!redis) {
    return null;
  }

  return (await redis.get<T>(key)) ?? null;
}

export async function writeCache<T>(key: string, value: T, ttlSeconds: number) {
  const redis = getRedis();

  if (!redis) {
    return;
  }

  await redis.set(key, value, { ex: ttlSeconds });
}

