import type { FastifyRequest } from "fastify";
import { AppError } from "../errors/error-catalog.js";
import type { SupabaseClient } from "@supabase/supabase-js";

export function getUserSupabaseClient(request: FastifyRequest): SupabaseClient {
  if (!request.supabase) {
    throw new AppError("AUTH_PROVIDER_ERROR", "Contexto de dados autenticado indisponivel.", 503);
  }
  return request.supabase;
}
