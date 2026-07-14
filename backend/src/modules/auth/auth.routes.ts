import fp from "fastify-plugin";
import {
  authenticate,
  getAuthenticatedUser,
  requireRole,
} from "../../shared/auth/auth.middleware.js";
import type { Authenticator } from "../../shared/auth/auth.types.js";

const userResponseSchema = {
  type: "object",
  properties: {
    data: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        email: { type: "string", nullable: true },
        role: { type: "string", enum: ["student", "admin", "support"] },
      },
      required: ["id", "role"],
    },
  },
  required: ["data"],
} as const;

export const authRoutes = fp<{ authenticator: Authenticator }>(async (app, options) => {
  const authenticateRequest = authenticate(options.authenticator);

  app.get(
    "/v1/auth/me",
    {
      preHandler: authenticateRequest,
      schema: {
        tags: ["auth"],
        security: [{ bearerAuth: [] }],
        response: { 200: userResponseSchema },
      },
    },
    async (request) => {
      const user = getAuthenticatedUser(request);
      return { data: { id: user.id, email: user.email ?? null, role: user.role } };
    },
  );

  app.get(
    "/v1/auth/admin-check",
    {
      preHandler: [authenticateRequest, requireRole("admin")],
      schema: {
        tags: ["auth"],
        security: [{ bearerAuth: [] }],
        response: { 200: userResponseSchema },
      },
    },
    async (request) => {
      const user = getAuthenticatedUser(request);
      request.log.info({ userId: user.id, event: "auth.admin.access" }, "auth_event");
      return { data: { id: user.id, email: user.email ?? null, role: user.role } };
    },
  );
});
