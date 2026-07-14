import Fastify, { type FastifyInstance } from "fastify";
import type { AppEnv } from "./config/env.js";
import { env } from "./config/env.js";
import { corsPlugin } from "./plugins/cors.js";
import { swaggerPlugin } from "./plugins/swagger.js";
import { registerErrorHandler } from "./shared/http/error-handler.js";
import { createLogger } from "./shared/logger/logger.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import type { Authenticator } from "./shared/auth/auth.types.js";
import { createSupabaseAuthenticator } from "./shared/auth/supabase-authenticator.js";
import { semesterRoutes } from "./modules/semesters/semesters.module.js";
import { subjectRoutes } from "./modules/subjects/subjects.module.js";
import { teacherRoutes } from "./modules/teachers/teachers.module.js";
import { academicEventRoutes } from "./modules/academic-events/academic-events.module.js";
import { notificationRoutes } from "./modules/notifications/notifications.module.js";
import { fileExtractionRoutes } from "./modules/file-extractions/file-extractions.module.js";

export type AppDependencies = { authenticator?: Authenticator };

export async function buildApp(
  config: AppEnv = env,
  dependencies: AppDependencies = {},
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: createLogger(config),
    genReqId: () => crypto.randomUUID(),
  });
  app.decorateRequest("user", null);
  app.decorateRequest("supabase", null);

  registerErrorHandler(app);
  await app.register(corsPlugin, { env: config });
  await app.register(swaggerPlugin);
  await app.register(healthRoutes, { env: config });
  const authenticator = dependencies.authenticator ?? createSupabaseAuthenticator(config);
  await app.register(authRoutes, {
    authenticator,
  });
  await app.register(semesterRoutes, { authenticator });
  await app.register(subjectRoutes, { authenticator });
  await app.register(teacherRoutes, { authenticator });
  await app.register(academicEventRoutes, { authenticator });
  await app.register(notificationRoutes, { authenticator });
  await app.register(fileExtractionRoutes, { authenticator });

  return app;
}
