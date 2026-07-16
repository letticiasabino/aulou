import fp from "fastify-plugin";
import { z } from "zod";
import type { AppEnv } from "../../config/env.js";
import { createAdminClient } from "../../integrations/supabase/admin-client.js";
import { authenticate, getAuthenticatedUser } from "../../shared/auth/auth.middleware.js";
import type { Authenticator } from "../../shared/auth/auth.types.js";
import { AppError } from "../../shared/errors/error-catalog.js";

export const jobRoutes = fp<{ authenticator: Authenticator; config: AppEnv }>(
  async (app, options) => {
    app.post(
      "/v1/jobs/:id/cancel",
      { preHandler: authenticate(options.authenticator) },
      async (request) => {
        const user = getAuthenticatedUser(request);
        const id = z.object({ id: z.string().uuid() }).parse(request.params).id;
        const result = await createAdminClient(options.config).rpc("cancel_background_job_server", {
          target_job_id: id,
          caller_id: user.id,
        });
        if (result.error?.code === "P0002")
          throw new AppError("JOB_NOT_FOUND", "Job nao encontrado.", 404);
        if (result.error?.code === "P0001")
          throw new AppError(
            "JOB_NOT_CANCELLABLE",
            "Job nao pode ser cancelado neste estado.",
            409,
          );
        if (result.error || !result.data)
          throw new AppError("INTERNAL_ERROR", "Nao foi possivel cancelar job.", 500);
        return { data: { id: result.data.id, status: result.data.status } };
      },
    );
  },
);
