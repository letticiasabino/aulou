import fp from "fastify-plugin";
import { z } from "zod";
import { authenticate, getAuthenticatedUser } from "../../shared/auth/auth.middleware.js";
import { getUserSupabaseClient } from "../../shared/http/request-context.js";
import { mapDatabaseError } from "../../shared/http/database-errors.js";
import {
  paginationMeta,
  paginationQuerySchema,
  paginationRange,
} from "../../shared/http/pagination.js";
import { AppError } from "../../shared/errors/error-catalog.js";
import type { Authenticator } from "../../shared/auth/auth.types.js";

const status = z.enum(["planned", "active", "completed", "archived"]);
const id = z.string().uuid();
export const semesterBodySchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: status.default("planned"),
  })
  .strict()
  .superRefine((v, c) => {
    if (v.startDate > v.endDate)
      c.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "A data final deve ser posterior ou igual a inicial.",
      });
  });
const body = semesterBodySchema;
const update = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: status.optional(),
  })
  .strict();
const query = paginationQuerySchema.extend({
  status: status.optional(),
  includeArchived: z.coerce.boolean().default(false),
});

type SemesterInput = z.infer<typeof body>;
function row(value: Record<string, unknown>) {
  return {
    id: value.id,
    userId: value.user_id,
    name: value.name,
    startDate: value.start_date,
    endDate: value.end_date,
    status: value.status,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}

export const semesterRoutes = fp<{ authenticator: Authenticator }>(async (app, options) => {
  const auth = authenticate(options.authenticator);
  app.get("/v1/semesters", { preHandler: auth }, async (request) => {
    const q = query.parse(request.query);
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    const { from, to } = paginationRange(q.page, q.limit);
    let requestQuery = client
      .from("semesters")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .range(from, to);
    if (q.status) requestQuery = requestQuery.eq("status", q.status);
    else if (!q.includeArchived) requestQuery = requestQuery.neq("status", "archived");
    const result = await requestQuery;
    if (result.error) mapDatabaseError(result.error);
    return {
      data: (result.data ?? []).map((v) => row(v as Record<string, unknown>)),
      meta: paginationMeta(q.page, q.limit, result.count ?? 0),
    };
  });
  app.post("/v1/semesters", { preHandler: auth }, async (request, reply) => {
    const input = body.parse(request.body) as SemesterInput;
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    if (input.status === "active") {
      const active = await client
        .from("semesters")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (active.error) mapDatabaseError(active.error);
      if (active.data)
        throw new AppError("SEMESTER_ALREADY_ACTIVE", "Ja existe um semestre ativo.", 409);
    }
    const result = await client
      .from("semesters")
      .insert({
        user_id: user.id,
        name: input.name,
        start_date: input.startDate.toISOString().slice(0, 10),
        end_date: input.endDate.toISOString().slice(0, 10),
        status: input.status,
      })
      .select()
      .single();
    if (result.error) mapDatabaseError(result.error);
    return reply.code(201).send({ data: row(result.data as Record<string, unknown>) });
  });
  app.get("/v1/semesters/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const user = getAuthenticatedUser(request);
    const result = await getUserSupabaseClient(request)
      .from("semesters")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data) throw new AppError("SEMESTER_NOT_FOUND", "Semestre nao encontrado.", 404);
    return { data: row(result.data as Record<string, unknown>) };
  });
  app.patch("/v1/semesters/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const input = update.parse(request.body);
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    const current = await client
      .from("semesters")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (current.error) mapDatabaseError(current.error);
    if (!current.data) throw new AppError("SEMESTER_NOT_FOUND", "Semestre nao encontrado.", 404);
    const currentRow = current.data as Record<string, unknown>;
    const startDate = input.startDate ?? new Date(String(currentRow.start_date));
    const endDate = input.endDate ?? new Date(String(currentRow.end_date));
    if (startDate > endDate)
      throw new AppError("SEMESTER_DATE_RANGE_INVALID", "Intervalo de datas invalido.", 422);
    if (input.status === "active") {
      const active = await client
        .from("semesters")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .neq("id", params.id)
        .maybeSingle();
      if (active.data)
        throw new AppError("SEMESTER_ALREADY_ACTIVE", "Ja existe um semestre ativo.", 409);
    }
    const result = await client
      .from("semesters")
      .update({
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.startDate === undefined
          ? {}
          : { start_date: input.startDate.toISOString().slice(0, 10) }),
        ...(input.endDate === undefined
          ? {}
          : { end_date: input.endDate.toISOString().slice(0, 10) }),
        ...(input.status === undefined ? {} : { status: input.status }),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (result.error) mapDatabaseError(result.error);
    return { data: row(result.data as Record<string, unknown>) };
  });
  app.delete("/v1/semesters/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const user = getAuthenticatedUser(request);
    const result = await getUserSupabaseClient(request)
      .from("semesters")
      .update({ status: "archived" })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data) throw new AppError("SEMESTER_NOT_FOUND", "Semestre nao encontrado.", 404);
    return { data: { id: params.id, status: "archived" } };
  });
});
