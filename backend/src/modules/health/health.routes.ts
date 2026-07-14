import fp from "fastify-plugin";
import type { AppEnv } from "../../config/env.js";
import { healthResponseSchema, readyResponseSchema } from "../../shared/validation/schemas.js";

const healthJsonSchema = {
  type: "object",
  properties: {
    status: { type: "string", const: "ok" },
    service: { type: "string", const: "aulou-api" },
    version: { type: "string", const: "1.0.0" },
    environment: { type: "string", enum: ["development", "test", "production"] },
  },
  required: ["status", "service", "version", "environment"],
} as const;

const readyJsonSchema = {
  ...healthJsonSchema,
  properties: {
    ...healthJsonSchema.properties,
    status: { type: "string", const: "ready" },
    checks: { type: "object", properties: { configuration: { type: "string", const: "ok" } } },
  },
  required: [...healthJsonSchema.required, "checks"],
} as const;

export const healthRoutes = fp<{ env: AppEnv }>(async (app, options) => {
  app.get(
    "/health",
    { schema: { tags: ["health"], response: { 200: healthJsonSchema } } },
    async () =>
      healthResponseSchema.parse({
        status: "ok",
        service: "aulou-api",
        version: "1.0.0",
        environment: options.env.NODE_ENV,
      }),
  );

  app.get(
    "/ready",
    { schema: { tags: ["health"], response: { 200: readyJsonSchema } } },
    async () =>
      readyResponseSchema.parse({
        status: "ready",
        service: "aulou-api",
        version: "1.0.0",
        environment: options.env.NODE_ENV,
        checks: { configuration: "ok" },
      }),
  );
});
