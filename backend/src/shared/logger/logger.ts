import pino from "pino";
import type { AppEnv } from "../../config/env.js";

export function createLogger(config: AppEnv): pino.LoggerOptions {
  return {
    level: config.NODE_ENV === "development" ? "debug" : "info",
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "*.password",
        "*.token",
        "*.apiKey",
      ],
      censor: "[REDACTED]",
    },
    transport:
      config.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
        : undefined,
  };
}
