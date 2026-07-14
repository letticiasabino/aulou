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
const body = z
  .object({
    name: z.string().trim().min(1).max(160),
    email: z.string().email().max(254).optional(),
    phone: z.string().trim().max(40).optional(),
    institution: z.string().trim().max(160).optional(),
    notes: z.string().max(2000).optional(),
  })
  .strict();
const update = body.partial();
const query = paginationQuerySchema.extend({
  search: z.string().trim().max(100).optional(),
  subjectId: id.optional(),
});
function row(v: Record<string, unknown>) {
  return {
    id: v.id,
    userId: v.user_id,
    name: v.name,
    email: v.email,
    phone: v.phone,
    institution: v.institution,
    notes: v.notes,
    createdAt: v.created_at,
    updatedAt: v.updated_at,
  };
}
export const teacherRoutes = fp<{ authenticator: Authenticator }>(async (app, options) => {
  const auth = authenticate(options.authenticator);
  app.get("/v1/teachers", { preHandler: auth }, async (request) => {
    const q = query.parse(request.query);
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    const { from, to } = paginationRange(q.page, q.limit);
    let builder = client
      .from("teachers")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("name")
      .range(from, to);
    if (q.subjectId) {
      const links = await client
        .from("subject_teachers")
        .select("teacher_id")
        .eq("subject_id", q.subjectId)
        .eq("user_id", user.id);
      if (links.error) mapDatabaseError(links.error);
      const teacherIds = (links.data ?? []).map((v) => v.teacher_id as string);
      if (!teacherIds.length) return { data: [], meta: paginationMeta(q.page, q.limit, 0) };
      builder = builder.in("id", teacherIds);
    }
    if (q.search) builder = builder.or(`name.ilike.%${q.search}%,email.ilike.%${q.search}%`);
    const result = await builder;
    if (result.error) mapDatabaseError(result.error);
    return {
      data: (result.data ?? []).map((v) => row(v as Record<string, unknown>)),
      meta: paginationMeta(q.page, q.limit, result.count ?? 0),
    };
  });
  app.post("/v1/teachers", { preHandler: auth }, async (request, reply) => {
    const input = body.parse(request.body);
    const user = getAuthenticatedUser(request);
    const result = await getUserSupabaseClient(request)
      .from("teachers")
      .insert({
        user_id: user.id,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        institution: input.institution ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .single();
    if (result.error) mapDatabaseError(result.error);
    return reply.code(201).send({ data: row(result.data as Record<string, unknown>) });
  });
  app.get("/v1/teachers/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const user = getAuthenticatedUser(request);
    const result = await getUserSupabaseClient(request)
      .from("teachers")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data) throw new AppError("TEACHER_NOT_FOUND", "Professor nao encontrado.", 404);
    return { data: row(result.data as Record<string, unknown>) };
  });
  app.patch("/v1/teachers/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const input = update.parse(request.body);
    const user = getAuthenticatedUser(request);
    const payload = {
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.email === undefined ? {} : { email: input.email }),
      ...(input.phone === undefined ? {} : { phone: input.phone }),
      ...(input.institution === undefined ? {} : { institution: input.institution }),
      ...(input.notes === undefined ? {} : { notes: input.notes }),
    };
    const result = await getUserSupabaseClient(request)
      .from("teachers")
      .update(payload)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data) throw new AppError("TEACHER_NOT_FOUND", "Professor nao encontrado.", 404);
    return { data: row(result.data as Record<string, unknown>) };
  });
  app.delete("/v1/teachers/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    const links = await client
      .from("subject_teachers")
      .select("subject_id")
      .eq("teacher_id", params.id)
      .eq("user_id", user.id);
    if ((links.data ?? []).length)
      throw new AppError("CONFLICT", "Professor possui disciplinas vinculadas.", 409);
    const result = await client
      .from("teachers")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data) throw new AppError("TEACHER_NOT_FOUND", "Professor nao encontrado.", 404);
    return { data: { id: params.id, deleted: true } };
  });
  app.post(
    "/v1/subjects/:subjectId/teachers/:teacherId",
    { preHandler: auth },
    async (request, reply) => {
      const params = z.object({ subjectId: id, teacherId: id }).parse(request.params);
      const user = getAuthenticatedUser(request);
      const client = getUserSupabaseClient(request);
      const [subject, teacher] = await Promise.all([
        client
          .from("subjects")
          .select("id")
          .eq("id", params.subjectId)
          .eq("user_id", user.id)
          .maybeSingle(),
        client
          .from("teachers")
          .select("id")
          .eq("id", params.teacherId)
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      if (!subject.data || !teacher.data)
        throw new AppError("RESOURCE_ACCESS_DENIED", "Acesso ao relacionamento negado.", 403);
      const result = await client
        .from("subject_teachers")
        .insert({ subject_id: params.subjectId, teacher_id: params.teacherId, user_id: user.id })
        .select()
        .single();
      if (result.error) mapDatabaseError(result.error);
      return reply
        .code(201)
        .send({ data: { subjectId: params.subjectId, teacherId: params.teacherId } });
    },
  );
  app.delete(
    "/v1/subjects/:subjectId/teachers/:teacherId",
    { preHandler: auth },
    async (request) => {
      const params = z.object({ subjectId: id, teacherId: id }).parse(request.params);
      const user = getAuthenticatedUser(request);
      const result = await getUserSupabaseClient(request)
        .from("subject_teachers")
        .delete()
        .eq("subject_id", params.subjectId)
        .eq("teacher_id", params.teacherId)
        .eq("user_id", user.id)
        .select("subject_id")
        .maybeSingle();
      if (result.error) mapDatabaseError(result.error);
      if (!result.data)
        throw new AppError("TEACHER_SUBJECT_LINK_NOT_FOUND", "Vinculo nao encontrado.", 404);
      return { data: { removed: true } };
    },
  );
  app.get("/v1/subjects/:subjectId/teachers", { preHandler: auth }, async (request) => {
    const params = z.object({ subjectId: id }).parse(request.params);
    const user = getAuthenticatedUser(request);
    const result = await getUserSupabaseClient(request)
      .from("teachers")
      .select("*, subject_teachers!inner(subject_id)")
      .eq("user_id", user.id)
      .eq("subject_teachers.subject_id", params.subjectId)
      .order("name");
    if (result.error) mapDatabaseError(result.error);
    return { data: (result.data ?? []).map((v) => row(v as Record<string, unknown>)) };
  });
});
