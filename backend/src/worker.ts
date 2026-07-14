import { env } from "./config/env.js";
import { runBackgroundWorker } from "./workers/background.worker.js";

const controller = new AbortController();
process.once("SIGTERM", () => controller.abort());
process.once("SIGINT", () => controller.abort());

await runBackgroundWorker(env, controller.signal);
