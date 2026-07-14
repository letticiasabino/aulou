import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { AppError, type ErrorCode } from "../errors/error-catalog.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    const validation =
      typeof error === "object" && error !== null && "validation" in error
        ? (error as { validation?: unknown }).validation
        : undefined;
    const isValidation = validation !== undefined || error instanceof ZodError;
    const appError = error instanceof AppError ? error : null;
    const code: ErrorCode =
      appError?.code ?? (isValidation ? "VALIDATION_ERROR" : "INTERNAL_ERROR");
    const statusCode = appError?.statusCode ?? (isValidation ? 422 : 500);
    const message = appError?.message ?? (isValidation ? "Entrada invalida." : "Erro interno.");
    const details =
      appError?.details ??
      (error instanceof ZodError ? error.flatten() : isValidation ? validation : null);

    if (statusCode >= 500) request.log.error({ err: error }, "request_failed");
    else request.log.warn({ code, statusCode }, "request_rejected");

    return reply.status(statusCode).send({
      error: { code, message, details, requestId: request.id },
    });
  });
}
