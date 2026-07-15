import fp from "fastify-plugin";
import { z } from "zod";
import { authenticate, getAuthenticatedUser } from "../../shared/auth/auth.middleware.js";
import type { Authenticator } from "../../shared/auth/auth.types.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppEnv } from "../../config/env.js";
import { createAdminClient } from "../../integrations/supabase/admin-client.js";
import { AppError } from "../../shared/errors/error-catalog.js";
import { mapDatabaseError } from "../../shared/http/database-errors.js";
import {
  paginationMeta,
  paginationQuerySchema,
  paginationRange,
} from "../../shared/http/pagination.js";
import { getUserSupabaseClient } from "../../shared/http/request-context.js";

const uuid = z.string().uuid();
const createBody = z.object({ fileId: uuid }).strict();
const paramsSchema = z.object({ id: uuid });
const querySchema = paginationQuerySchema.extend({
  fileId: uuid.optional(),
  status: z.enum(["pending", "processing", "completed", "failed", "ocr_required"]).optional(),
});

function mapExtraction(value: Record<string, unknown>, includeText = true) {
  return {
    id: value.id,
    fileId: value.file_id,
    status: value.status,
    provider: value.provider,
    adapter: value.adapter,
    ...(includeText ? { rawText: value.raw_text } : {}),
    structuredPayload: value.structured_payload,
    safeError: value.safe_error,
    tokenCount: value.token_count,
    normalizedCharCount: value.normalized_char_count,
    pageCount: value.page_count,
    sheetCount: value.sheet_count,
    rowCount: value.row_count,
    metrics: value.metrics,
    warnings: value.warnings,
    startedAt: value.started_at,
    completedAt: value.completed_at,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}

export const fileExtractionRoutes = fp<{
  authenticator: Authenticator;
  config: AppEnv;
  jobClient?: SupabaseClient;
}>(async (app, options) => {
  const auth = authenticate(options.authenticator);

  app.post("/v1/file-extractions", { preHandler: auth }, async (request, reply) => {
    const input = createBody.parse(request.body);
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    const header = request.headers["idempotency-key"];
    const requestKey = z
      .string()
      .trim()
      .min(1)
      .max(200)
      .parse(Array.isArray(header) ? header[0] : (header ?? `file:${input.fileId}`));
    const file = await client
      .from("files")
      .select("id,size_bytes,status")
      .eq("id", input.fileId)
      .eq("user_id", user.id)
      .neq("status", "deleted")
      .maybeSingle();
    if (file.error) mapDatabaseError(file.error);
    if (!file.data) throw new AppError("FILE_NOT_FOUND", "Arquivo nao encontrado.", 404);
    if (Number(file.data.size_bytes) > 10 * 1024 * 1024) {
      throw new AppError(
        "FILE_EXTRACTION_LIMIT_EXCEEDED",
        "Arquivo excede o limite de 10 MB.",
        422,
      );
    }
    const jobsClient = options.jobClient ?? createAdminClient(options.config);
    const result = await jobsClient.rpc("request_file_extraction_server", {
      target_file_id: input.fileId,
      requested_key: requestKey,
      caller_id: user.id,
      requested_environment: options.config.APP_ENVIRONMENT,
    });
    if (result.error) mapDatabaseError(result.error, "Nao foi possivel solicitar a extracao.");
    return reply.code(202).send({ data: mapExtraction(result.data as Record<string, unknown>) });
  });

  app.get("/v1/file-extractions", { preHandler: auth }, async (request) => {
    const query = querySchema.parse(request.query);
    const user = getAuthenticatedUser(request);
    const { from, to } = paginationRange(query.page, query.limit);
    let builder = getUserSupabaseClient(request)
      .from("file_extractions")
      .select(
        "id,file_id,status,provider,adapter,structured_payload,safe_error,token_count,normalized_char_count,page_count,sheet_count,row_count,metrics,warnings,started_at,completed_at,created_at,updated_at",
        { count: "exact" },
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (query.fileId) builder = builder.eq("file_id", query.fileId);
    if (query.status) builder = builder.eq("status", query.status);
    const result = await builder;
    if (result.error) mapDatabaseError(result.error);
    return {
      data: (result.data ?? []).map((item) =>
        mapExtraction(item as Record<string, unknown>, false),
      ),
      meta: paginationMeta(query.page, query.limit, result.count ?? 0),
    };
  });

  app.get("/v1/file-extractions/:id", { preHandler: auth }, async (request) => {
    const params = paramsSchema.parse(request.params);
    const user = getAuthenticatedUser(request);
    const result = await getUserSupabaseClient(request)
      .from("file_extractions")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data)
      throw new AppError("FILE_EXTRACTION_NOT_FOUND", "Extracao nao encontrada.", 404);
    return { data: mapExtraction(result.data as Record<string, unknown>) };
  });

  app.post("/v1/file-extractions/:id/retry", { preHandler: auth }, async (request, reply) => {
    const params = paramsSchema.parse(request.params);
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    const existing = await client
      .from("file_extractions")
      .select("id,status")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing.error) mapDatabaseError(existing.error);
    if (!existing.data)
      throw new AppError("FILE_EXTRACTION_NOT_FOUND", "Extracao nao encontrada.", 404);
    if (!new Set(["failed", "ocr_required"]).has(String(existing.data.status))) {
      throw new AppError(
        "FILE_EXTRACTION_NOT_RETRYABLE",
        "Extracao nao pode ser repetida neste estado.",
        409,
      );
    }
    const jobsClient = options.jobClient ?? createAdminClient(options.config);
    const result = await jobsClient.rpc("retry_file_extraction_server", {
      target_extraction_id: params.id,
      caller_id: user.id,
    });
    if (result.error) mapDatabaseError(result.error, "Nao foi possivel repetir a extracao.");
    return reply.code(202).send({ data: mapExtraction(result.data as Record<string, unknown>) });
  });
});
