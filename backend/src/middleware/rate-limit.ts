import type { FastifyRequest } from "fastify";

export type RateLimitDecision = { allowed: boolean; retryAfterSeconds?: number };

export function checkRateLimit(_request: FastifyRequest): RateLimitDecision {
  // Distributed rate limiting is intentionally deferred until Redis is justified.
  return { allowed: true };
}
