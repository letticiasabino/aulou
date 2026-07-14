import type { FastifyRequest } from "fastify";

export function requestId(request: FastifyRequest) {
  return request.id;
}
