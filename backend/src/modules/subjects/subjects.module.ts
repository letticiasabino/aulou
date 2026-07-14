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

const id = z.string().uuid();
const statuses = z.enum(["planned", "active", "completed", "dropped", "archived"]);
const color = z.string().regex(/^#[\da-f]{6}$/i, "Cor invalida.");
export const subjectBodySchema = z
  .object({
    semesterId: id,
    name: z.string().trim().min(1).max(160),
    code: z.string().trim().max(40).optional(),
    description: z.string().max(2000).optional(),
    color: color.optional(),
    workloadHours: z.number().min(0).max(10000).optional(),
    status: statuses.default("planned"),
  })
  .strict();
const body = subjectBodySchema;
const update = body.partial();
const query = paginationQuerySchema.extend({
  semesterId: id.optional(),
  status: statuses.optional(),
  search: z.string().trim().max(100).optional(),
  includeArchived: z.coerce.boolean().default(false),
});
function row(v: Record<string, unknown>) {
  return {
    id: v.id,
    userId: v.user_id,
    semesterId: v.semester_id,
    name: v.name,
    code: v.code,
    description: v.description,
    color: v.color,
    workloadHours: v.workload_hours,
    status: v.status,
    createdAt: v.created_at,
    updatedAt: v.updated_at,
  };
}
export const subjectRoutes = fp<{ authenticator: Authenticator }>(async (app, options) => {
  const auth = authenticate(options.authenticator);
  app.get("/v1/subjects", { preHandler: auth }, async (request) => {
    const q = query.parse(request.query);
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    const { from, to } = paginationRange(q.page, q.limit);
    let queryBuilder = client
      .from("subjects")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("name")
      .range(from, to);
    if (q.semesterId) queryBuilder = queryBuilder.eq("semester_id", q.semesterId);
    if (q.status) queryBuilder = queryBuilder.eq("status", q.status);
    else if (!q.includeArchived) queryBuilder = queryBuilder.neq("status", "archived");
    if (q.search)
      queryBuilder = queryBuilder.or(`name.ilike.%${q.search}%,code.ilike.%${q.search}%`);
    const result = await queryBuilder;
    if (result.error) mapDatabaseError(result.error);
    return {
      data: (result.data ?? []).map((v) => row(v as Record<string, unknown>)),
      meta: paginationMeta(q.page, q.limit, result.count ?? 0),
    };
  });
  app.post("/v1/subjects", { preHandler: auth }, async (request, reply) => {
    const input = body.parse(request.body);
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    const semester = await client
      .from("semesters")
      .select("id")
      .eq("id", input.semesterId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (semester.error) mapDatabaseError(semester.error);
    if (!semester.data) throw new AppError("SUBJECT_SEMESTER_INVALID", "Semestre invalido.", 422);
    const result = await client
      .from("subjects")
      .insert({
        user_id: user.id,
        semester_id: input.semesterId,
        name: input.name,
        code: input.code ?? null,
        description: input.description ?? null,
        color: input.color ?? null,
        workload_hours: input.workloadHours ?? null,
        status: input.status,
      })
      .select()
      .single();
    if (result.error) mapDatabaseError(result.error);
    return reply.code(201).send({ data: row(result.data as Record<string, unknown>) });
  });
  app.get("/v1/subjects/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const user = getAuthenticatedUser(request);
    const result = await getUserSupabaseClient(request)
      .from("subjects")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data) throw new AppError("SUBJECT_NOT_FOUND", "Disciplina nao encontrada.", 404);
    return { data: row(result.data as Record<string, unknown>) };
  });
  app.patch("/v1/subjects/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const input = update.parse(request.body);
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    if (input.semesterId) {
      const semester = await client
        .from("semesters")
        .select("id")
        .eq("id", input.semesterId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!semester.data) throw new AppError("SUBJECT_SEMESTER_INVALID", "Semestre invalido.", 422);
    }
    const payload = {
      ...(input.semesterId === undefined ? {} : { semester_id: input.semesterId }),
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.code === undefined ? {} : { code: input.code }),
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.color === undefined ? {} : { color: input.color }),
      ...(input.workloadHours === undefined ? {} : { workload_hours: input.workloadHours }),
      ...(input.status === undefined ? {} : { status: input.status }),
    };
    const result = await client
      .from("subjects")
      .update(payload)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data) throw new AppError("SUBJECT_NOT_FOUND", "Disciplina nao encontrada.", 404);
    return { data: row(result.data as Record<string, unknown>) };
  });
  app.delete("/v1/subjects/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const user = getAuthenticatedUser(request);
    const result = await getUserSupabaseClient(request)
      .from("subjects")
      .update({ status: "archived" })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data) throw new AppError("SUBJECT_NOT_FOUND", "Disciplina nao encontrada.", 404);
    return { data: { id: params.id, status: "archived" } };
  });
});
