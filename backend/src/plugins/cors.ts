import cors from "@fastify/cors";
import fp from "fastify-plugin";
import type { AppEnv } from "../config/env.js";

export const corsPlugin = fp<{ env: AppEnv }>(async (app, options) => {
  await app.register(cors, {
    origin: [options.env.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
  });
});
