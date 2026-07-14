import fp from "fastify-plugin";
import { z } from "zod";
import type { Authenticator } from "../../shared/auth/auth.types.js";
import { authenticate, getAuthenticatedUser } from "../../shared/auth/auth.middleware.js";
import { AppError } from "../../shared/errors/error-catalog.js";
import { mapDatabaseError } from "../../shared/http/database-errors.js";
import {
  paginationMeta,
  paginationQuerySchema,
  paginationRange,
} from "../../shared/http/pagination.js";
import { getUserSupabaseClient } from "../../shared/http/request-context.js";

const querySchema = paginationQuerySchema.extend({ unreadOnly: z.coerce.boolean().default(false) });
const paramsSchema = z.object({ notificationId: z.string().min(1).max(220) });

function row(value: Record<string, unknown>) {
  return {
    id: value.id,
    type: value.type,
    title: value.title,
    message: value.message,
    severity: value.severity,
    relatedEventId: value.related_event_id,
    relatedTaskId: value.related_task_id,
    scheduledFor: value.scheduled_for,
    readAt: value.read_at,
    createdAt: value.created_at,
  };
}

export const notificationRoutes = fp<{ authenticator: Authenticator }>(async (app, options) => {
  const auth = authenticate(options.authenticator);
  app.get("/v1/notifications", { preHandler: auth }, async (request) => {
    const query = querySchema.parse(request.query);
    const user = getAuthenticatedUser(request);
    const { from, to } = paginationRange(query.page, query.limit);
    let builder = getUserSupabaseClient(request)
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .lte("scheduled_for", new Date().toISOString())
      .order("created_at", { ascending: false })
      .range(from, to);
    if (query.unreadOnly) builder = builder.is("read_at", null);
    const result = await builder;
    if (result.error) mapDatabaseError(result.error);
    return {
      data: (result.data ?? []).map((item) => row(item as Record<string, unknown>)),
      meta: paginationMeta(query.page, query.limit, result.count ?? 0),
    };
  });

  app.patch("/v1/notifications/:notificationId/read", { preHandler: auth }, async (request) => {
    const params = paramsSchema.parse(request.params);
    const user = getAuthenticatedUser(request);
    const result = await getUserSupabaseClient(request)
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", params.notificationId)
      .eq("user_id", user.id)
      .select("*")
      .maybeSingle();
    if (result.error) mapDatabaseError(result.error);
    if (!result.data)
      throw new AppError("NOTIFICATION_NOT_FOUND", "Notificacao nao encontrada.", 404);
    return { data: row(result.data as Record<string, unknown>) };
  });
});
