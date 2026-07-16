import fp from "fastify-plugin";
import { z } from "zod";
import type { AppEnv } from "../../config/env.js";
import { createAdminClient } from "../../integrations/supabase/admin-client.js";
import { authenticate, getAuthenticatedUser } from "../../shared/auth/auth.middleware.js";
import type { Authenticator } from "../../shared/auth/auth.types.js";
import { AppError } from "../../shared/errors/error-catalog.js";
import { mapDatabaseError } from "../../shared/http/database-errors.js";

const allowed = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
const createSchema = z
  .object({
    filename: z.string().trim().min(1).max(180),
    contentType: z.enum(allowed),
    sizeBytes: z
      .number()
      .int()
      .positive()
      .max(10 * 1024 * 1024),
  })
  .strict();
const idSchema = z.object({ id: z.string().uuid() });
function safeName(name: string) {
  const clean = name
    .normalize("NFKC")
    .replace(/[\\/\0]/g, "-")
    .replace(/[^\w.()-]+/g, "-")
    .replace(/-+/g, "-");
  if (!clean || clean === "." || clean === "..")
    throw new AppError("VALIDATION_ERROR", "Nome de arquivo invalido.", 422);
  return clean;
}
function mapFile(row: Record<string, unknown>) {
  return {
    id: row.id,
    filename: row.original_name,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    status: row.status,
    createdAt: row.created_at,
  };
}

export const fileRoutes = fp<{ authenticator: Authenticator; config: AppEnv }>(
  async (app, options) => {
    const auth = authenticate(options.authenticator);
    app.post("/v1/files/upload-intents", { preHandler: auth }, async (request, reply) => {
      const input = createSchema.parse(request.body);
      const user = getAuthenticatedUser(request);
      const key = z
        .string()
        .min(1)
        .max(200)
        .parse(request.headers["idempotency-key"] ?? crypto.randomUUID());
      const admin = createAdminClient(options.config);
      const existing = await admin
        .from("file_upload_intents")
        .select("*")
        .eq("user_id", user.id)
        .eq("idempotency_key", key)
        .maybeSingle();
      let intent = existing.data;
      if (!intent) {
        const fileId = crypto.randomUUID();
        const path = `${user.id}/${fileId}/${safeName(input.filename)}`;
        const created = await admin
          .from("file_upload_intents")
          .insert({
            user_id: user.id,
            file_id: fileId,
            storage_path: path,
            original_name: input.filename,
            content_type: input.contentType,
            expected_size_bytes: input.sizeBytes,
            idempotency_key: key,
          })
          .select("*")
          .single();
        if (created.error || !created.data)
          throw new AppError("INTERNAL_ERROR", "Nao foi possivel preparar upload.", 500);
        intent = created.data;
      }
      if (new Date(intent.expires_at).getTime() <= Date.now())
        throw new AppError("FILE_UPLOAD_INTENT_EXPIRED", "Intencao de upload expirada.", 409);
      const signed = await admin.storage
        .from("academic-files")
        .createSignedUploadUrl(intent.storage_path);
      if (signed.error || !signed.data)
        throw new AppError("INTERNAL_ERROR", "Nao foi possivel preparar upload.", 500);
      return reply.code(201).send({
        data: {
          id: intent.id,
          fileId: intent.file_id,
          uploadUrl: signed.data.signedUrl,
          token: signed.data.token,
          expiresAt: intent.expires_at,
        },
      });
    });
    app.post(
      "/v1/files/upload-intents/:id/complete",
      { preHandler: auth },
      async (request, reply) => {
        const user = getAuthenticatedUser(request);
        const { id } = idSchema.parse(request.params);
        const admin = createAdminClient(options.config);
        const found = await admin
          .from("file_upload_intents")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        const intent = found.data;
        if (!intent)
          throw new AppError(
            "FILE_UPLOAD_INTENT_NOT_FOUND",
            "Intencao de upload nao encontrada.",
            404,
          );
        if (intent.status === "completed")
          return reply.send({ data: { id: intent.file_id, status: "uploaded" } });
        if (new Date(intent.expires_at).getTime() <= Date.now())
          throw new AppError("FILE_UPLOAD_INTENT_EXPIRED", "Intencao de upload expirada.", 409);
        const listed = await admin.storage
          .from("academic-files")
          .list(intent.storage_path.split("/").slice(0, -1).join("/"), {
            search: intent.storage_path.split("/").at(-1),
          });
        const object = listed.data?.find(
          (item) => item.name === intent.storage_path.split("/").at(-1),
        );
        if (
          listed.error ||
          !object ||
          Number(object.metadata?.size) !== Number(intent.expected_size_bytes)
        )
          throw new AppError("FILE_UPLOAD_NOT_COMPLETED", "Upload nao foi confirmado.", 409);
        const file = await admin
          .from("files")
          .upsert({
            id: intent.file_id,
            user_id: user.id,
            storage_path: intent.storage_path,
            original_name: intent.original_name,
            content_type: intent.content_type,
            size_bytes: intent.expected_size_bytes,
            status: "uploaded",
          })
          .select("*")
          .single();
        if (file.error || !file.data)
          throw new AppError("INTERNAL_ERROR", "Nao foi possivel persistir arquivo.", 500);
        await admin
          .from("file_upload_intents")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", id);
        return reply.send({ data: mapFile(file.data) });
      },
    );
    app.get("/v1/files", { preHandler: auth }, async (request) => {
      const user = getAuthenticatedUser(request);
      const result = await createAdminClient(options.config)
        .from("files")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });
      return { data: (result.data ?? []).map(mapFile) };
    });
    app.get("/v1/files/:id", { preHandler: auth }, async (request) => {
      const user = getAuthenticatedUser(request);
      const result = await createAdminClient(options.config)
        .from("files")
        .select("*")
        .eq("id", idSchema.parse(request.params).id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!result.data) throw new AppError("FILE_NOT_FOUND", "Arquivo nao encontrado.", 404);
      return { data: mapFile(result.data) };
    });
    app.delete("/v1/files/:id", { preHandler: auth }, async (request, reply) => {
      const user = getAuthenticatedUser(request);
      const admin = createAdminClient(options.config);
      const result = await admin
        .from("files")
        .select("*")
        .eq("id", idSchema.parse(request.params).id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!result.data) return reply.code(204).send();
      await admin.storage.from("academic-files").remove([result.data.storage_path]);
      await admin
        .from("files")
        .update({ status: "deleted", deleted_at: new Date().toISOString() })
        .eq("id", result.data.id)
        .eq("user_id", user.id);
      return reply.code(204).send();
    });
    app.post("/v1/files/:id/extractions", { preHandler: auth }, async (request, reply) => {
      const user = getAuthenticatedUser(request);
      const fileId = idSchema.parse(request.params).id;
      const key = z
        .string()
        .min(1)
        .max(200)
        .parse(request.headers["idempotency-key"] ?? `file:${fileId}`);
      const admin = createAdminClient(options.config);
      const file = await admin
        .from("files")
        .select("id,status,size_bytes")
        .eq("id", fileId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!file.data || file.data.status !== "uploaded")
        throw new AppError("FILE_NOT_FOUND", "Arquivo nao esta pronto para extracao.", 404);
      const extraction = await admin.rpc("request_file_extraction_server", {
        target_file_id: fileId,
        requested_key: key,
        caller_id: user.id,
        requested_environment: options.config.APP_ENVIRONMENT,
      });
      if (extraction.error || !extraction.data)
        mapDatabaseError(extraction.error, "Nao foi possivel solicitar a extracao.");
      const job = await admin
        .from("background_jobs")
        .select("id,status")
        .eq("idempotency_key", `file-extraction:${extraction.data.id}`)
        .eq("user_id", user.id)
        .maybeSingle();
      return reply
        .code(202)
        .send({
          data: {
            extractionId: extraction.data.id,
            jobId: job.data?.id,
            status: extraction.data.status,
          },
        });
    });
    app.get("/v1/files/:id/extractions", { preHandler: auth }, async (request) => {
      const user = getAuthenticatedUser(request);
      const fileId = idSchema.parse(request.params).id;
      const result = await createAdminClient(options.config)
        .from("file_extractions")
        .select("id,status,safe_error,adapter,metrics,warnings,created_at,updated_at")
        .eq("file_id", fileId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return { data: result.data ?? [] };
    });
  },
);
