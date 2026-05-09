import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string;
}

/**
 * Rate limiting middleware using Redis
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix = 'rl:' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redis = await getRedisClient();
      const key = `${keyPrefix}${req.ip || req.socket.remoteAddress}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      res.set('X-RateLimit-Limit', maxRequests.toString());
      res.set('X-RateLimit-Remaining', Math.max(0, maxRequests - current).toString());

      if (current > maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests',
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open - don't block if Redis is down
      next();
    }
  };
}

/**
 * Public endpoint rate limiter (100 req/min)
 */
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyPrefix: 'rl:public:',
});

/**
 * API rate limiter (1000 req/min)
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 1000,
  keyPrefix: 'rl:api:',
});

/**
 * Auth rate limiter (5 attempts/15min)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  keyPrefix: 'rl:auth:',
});
