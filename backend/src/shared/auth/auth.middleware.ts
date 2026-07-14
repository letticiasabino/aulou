import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/error-catalog.js";
import type { Authenticator, AppRole, AuthenticatedUser } from "./auth.types.js";

function getBearerToken(request: FastifyRequest): string {
  const header = request.headers.authorization;
  if (!header) throw new AppError("AUTHENTICATION_REQUIRED", "Autenticacao necessaria.", 401);

  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match?.[1]?.trim()) throw new AppError("INVALID_AUTH_TOKEN", "Token invalido.", 401);
  return match[1].trim();
}

export function authenticate(authenticator: Authenticator) {
  return async function authenticateRequest(request: FastifyRequest, _reply: FastifyReply) {
    const token = getBearerToken(request);
    request.user = await authenticator.authenticate(token);
    request.supabase = authenticator.createClient?.(token) ?? null;
    request.log.info({ userId: request.user.id, event: "auth.token.validated" }, "auth_event");
  };
}

export function getAuthenticatedUser(request: FastifyRequest): AuthenticatedUser {
  if (!request.user) throw new AppError("AUTHENTICATION_REQUIRED", "Autenticacao necessaria.", 401);
  return request.user;
}

export function requireRole(role: AppRole) {
  return async function requireSingleRole(request: FastifyRequest) {
    const user = getAuthenticatedUser(request);
    if (user.role !== role) {
      request.log.warn({ userId: user.id, event: "auth.permission.denied" }, "auth_event");
      throw new AppError("INSUFFICIENT_PERMISSIONS", "Permissao insuficiente.", 403);
    }
  };
}

export function requireAnyRole(roles: readonly AppRole[]) {
  return async function requireAllowedRole(request: FastifyRequest) {
    const user = getAuthenticatedUser(request);
    if (!roles.includes(user.role)) {
      request.log.warn({ userId: user.id, event: "auth.permission.denied" }, "auth_event");
      throw new AppError("INSUFFICIENT_PERMISSIONS", "Permissao insuficiente.", 403);
    }
  };
}

export function requireOwnership(resolveOwnerId: (request: FastifyRequest) => string | null) {
  return async function requireResourceOwnership(request: FastifyRequest) {
    const user = getAuthenticatedUser(request);
    if (resolveOwnerId(request) !== user.id) {
      throw new AppError("RESOURCE_ACCESS_DENIED", "Acesso ao recurso negado.", 403);
    }
  };
}

export async function getAuthContext(request: FastifyRequest): Promise<AuthenticatedUser | null> {
  return request.user;
}
