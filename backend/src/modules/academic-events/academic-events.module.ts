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
const eventType = z.enum([
  "exam",
  "assignment",
  "class",
  "deadline",
  "forum",
  "presentation",
  "meeting",
  "study_session",
  "review",
  "other",
]);
const eventStatus = z.enum(["scheduled", "completed", "cancelled", "overdue", "archived"]);
const priority = z.enum(["low", "medium", "high", "critical"]);
export const academicEventBodySchema = z
  .object({
    semesterId: id.optional(),
    subjectId: id.optional(),
    title: z.string().trim().min(1).max(160),
    description: z.string().max(4000).optional(),
    eventType,
    startAt: z.coerce.date(),
    endAt: z.coerce.date().optional(),
    allDay: z.boolean().default(false),
    location: z.string().trim().max(300).optional(),
    status: eventStatus.default("scheduled"),
    priority: priority.default("medium"),
    weight: z.number().min(0).max(100).optional(),
  })
  .strict()
  .superRefine((v, c) => {
    if (v.endAt && v.endAt < v.startAt)
      c.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "O fim nao pode ser anterior ao inicio.",
      });
  });
const body = academicEventBodySchema;
const update = z
  .object({
    semesterId: id.optional(),
    subjectId: id.optional(),
    title: z.string().trim().min(1).max(240).optional(),
    description: z.string().max(4000).optional(),
    eventType: eventType.optional(),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
    allDay: z.boolean().optional(),
    location: z.string().trim().max(300).optional(),
    status: eventStatus.optional(),
    priority: priority.optional(),
    weight: z.number().min(0).max(100).optional(),
  })
  .strict();
const query = paginationQuerySchema.extend({
  semesterId: id.optional(),
  subjectId: id.optional(),
  eventType: eventType.optional(),
  status: eventStatus.optional(),
  priority: priority.optional(),
  startFrom: z.coerce.date().optional(),
  startTo: z.coerce.date().optional(),
  needsReview: z.coerce.boolean().optional(),
  search: z.string().trim().max(100).optional(),
});
function row(v: Record<string, unknown>) {
  return {
    id: v.id,
    userId: v.user_id,
    semesterId: v.semester_id,
    subjectId: v.subject_id,
    title: v.title,
    description: v.description,
    eventType: v.event_type,
    startAt: v.start_at,
    endAt: v.end_at,
    allDay: v.all_day,
    location: v.location,
    status: v.status,
    priority: v.priority,
    weight: v.weight,
    source: v.source,
    sourceFileId: v.source_file_id,
    confidenceScore: v.confidence_score,
    needsReview: v.needs_review,
    createdByAi: v.created_by_ai,
    createdAt: v.created_at,
    updatedAt: v.updated_at,
  };
}

export const academicEventRoutes = fp<{ authenticator: Authenticator }>(async (app, options) => {
  const auth = authenticate(options.authenticator);
  app.get("/v1/academic-events", { preHandler: auth }, async (request) => {
    const q = query.parse(request.query);
    const user = getAuthenticatedUser(request);
    const { from, to } = paginationRange(q.page, q.limit);
    const client = getUserSupabaseClient(request);
    let builder = client
      .from("academic_events")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("start_at", { ascending: true })
      .range(from, to);
    if (q.semesterId) builder = builder.eq("semester_id", q.semesterId);
    if (q.subjectId) builder = builder.eq("subject_id", q.subjectId);
    if (q.eventType) builder = builder.eq("event_type", q.eventType);
    if (q.status) builder = builder.eq("status", q.status);
    else builder = builder.neq("status", "archived");
    if (q.priority) builder = builder.eq("priority", q.priority);
    if (q.needsReview !== undefined) builder = builder.eq("needs_review", q.needsReview);
    if (q.startFrom) builder = builder.gte("start_at", q.startFrom.toISOString());
    if (q.startTo) builder = builder.lte("start_at", q.startTo.toISOString());
    if (q.search) builder = builder.ilike("title", `%${q.search}%`);
    const result = await builder;
    if (result.error) mapDatabaseError(result.error);
    return {
      data: (result.data ?? []).map((v) => row(v as Record<string, unknown>)),
      meta: paginationMeta(q.page, q.limit, result.count ?? 0),
    };
  });
  app.post("/v1/academic-events", { preHandler: auth }, async (request, reply) => {
    const input = body.parse(request.body);
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    if (input.semesterId) {
      const semester = await client
        .from("semesters")
        .select("id")
        .eq("id", input.semesterId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!semester.data)
        throw new AppError("ACADEMIC_EVENT_SEMESTER_INVALID", "Semestre invalido.", 422);
    }
    if (input.subjectId) {
      const subject = await client
        .from("subjects")
        .select("id,name")
        .eq("id", input.subjectId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!subject.data)
        throw new AppError("ACADEMIC_EVENT_SUBJECT_INVALID", "Disciplina invalida.", 422);
    }
    const startAt = input.startAt.toISOString();
    const endAt = input.endAt?.toISOString() ?? null;
    const result = await client
      .from("academic_events")
      .insert({
        user_id: user.id,
        semester_id: input.semesterId ?? null,
        subject_id: input.subjectId ?? null,
        subject_name: input.subjectId ?? "Sem disciplina",
        title: input.title,
        description: input.description ?? null,
        event_type: input.eventType,
        start_at: startAt,
        end_at: endAt,
        starts_at: startAt,
        ends_at: endAt,
        all_day: input.allDay,
        is_all_day: input.allDay,
        location: input.location ?? null,
        status: input.status,
        priority: input.priority,
        weight: input.weight ?? null,
        source: "manual",
        source_file_id: null,
        confidence_score: 1,
        confidence_label: "high_confidence",
        needs_review: false,
        created_by_ai: false,
        dedupe_key: `${user.id}:${startAt}:${input.title}`,
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (result.error) mapDatabaseError(result.error);
    return reply.code(201).send({ data: row(result.data as Record<string, unknown>) });
  });
  app.get("/v1/academic-events/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const user = getAuthenticatedUser(request);
    const result = await getUserSupabaseClient(request)
      .from("academic_events")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data) throw new AppError("ACADEMIC_EVENT_NOT_FOUND", "Evento nao encontrado.", 404);
    return { data: row(result.data as Record<string, unknown>) };
  });
  app.patch("/v1/academic-events/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const input = update.parse(request.body);
    const user = getAuthenticatedUser(request);
    const client = getUserSupabaseClient(request);
    const current = await client
      .from("academic_events")
      .select("start_at,end_at")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!current.data)
      throw new AppError("ACADEMIC_EVENT_NOT_FOUND", "Evento nao encontrado.", 404);
    if (input.semesterId) {
      const linked = await client
        .from("semesters")
        .select("id")
        .eq("id", input.semesterId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!linked.data)
        throw new AppError("ACADEMIC_EVENT_SEMESTER_INVALID", "Semestre invalido.", 422);
    }
    if (input.subjectId) {
      const linked = await client
        .from("subjects")
        .select("id")
        .eq("id", input.subjectId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!linked.data)
        throw new AppError("ACADEMIC_EVENT_SUBJECT_INVALID", "Disciplina invalida.", 422);
    }
    const startAt = input.startAt?.toISOString();
    const endAt = input.endAt?.toISOString();
    if (startAt && endAt && new Date(endAt) < new Date(startAt))
      throw new AppError("ACADEMIC_EVENT_DATE_RANGE_INVALID", "Intervalo de datas invalido.", 422);
    const payload = {
      ...(input.semesterId === undefined ? {} : { semester_id: input.semesterId }),
      ...(input.subjectId === undefined ? {} : { subject_id: input.subjectId }),
      ...(input.title === undefined ? {} : { title: input.title }),
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.eventType === undefined ? {} : { event_type: input.eventType }),
      ...(startAt === undefined ? {} : { start_at: startAt }),
      ...(endAt === undefined ? {} : { end_at: endAt }),
      ...(input.allDay === undefined ? {} : { all_day: input.allDay }),
      ...(input.location === undefined ? {} : { location: input.location }),
      ...(input.status === undefined ? {} : { status: input.status }),
      ...(input.priority === undefined ? {} : { priority: input.priority }),
      ...(input.weight === undefined ? {} : { weight: input.weight }),
    };
    const result = await client
      .from("academic_events")
      .update(payload)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data) throw new AppError("ACADEMIC_EVENT_NOT_FOUND", "Evento nao encontrado.", 404);
    return { data: row(result.data as Record<string, unknown>) };
  });
  app.delete("/v1/academic-events/:id", { preHandler: auth }, async (request) => {
    const params = z.object({ id }).parse(request.params);
    const user = getAuthenticatedUser(request);
    const result = await getUserSupabaseClient(request)
      .from("academic_events")
      .update({ status: "archived" })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data) throw new AppError("ACADEMIC_EVENT_NOT_FOUND", "Evento nao encontrado.", 404);
    return { data: { id: params.id, status: "archived" } };
  });
});
