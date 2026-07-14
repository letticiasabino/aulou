import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { AppError } from "../../shared/errors/error-catalog.js";
import { parseEnv } from "../../config/env.js";
import type { Authenticator, AuthenticatedUser } from "../../shared/auth/auth.types.js";

const student: AuthenticatedUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "student@aulou.test",
  role: "student",
};
const admin: AuthenticatedUser = {
  ...student,
  id: "22222222-2222-4222-8222-222222222222",
  role: "admin",
};

const authenticator: Authenticator = {
  async authenticate(token) {
    if (token === "student-token") return student;
    if (token === "admin-token") return admin;
    if (token === "expired-token") throw new AppError("EXPIRED_AUTH_TOKEN", "Token expirado.", 401);
    throw new AppError("INVALID_AUTH_TOKEN", "Token invalido.", 401);
  },
};

const app = await buildApp(parseEnv({ NODE_ENV: "test", FRONTEND_URL: "http://localhost:3000" }), {
  authenticator,
});

beforeAll(async () => app.ready());
afterAll(async () => app.close());

describe("Supabase authentication boundary", () => {
  it("rejects a missing bearer token", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/auth/me" });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("rejects a malformed bearer token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: "Basic token" },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("INVALID_AUTH_TOKEN");
  });

  it("derives the user from a valid token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: "Bearer student-token" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: { id: student.id, email: student.email, role: student.role },
    });
  });

  it("denies a student on the admin route", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/admin-check",
      headers: { authorization: "Bearer student-token" },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("INSUFFICIENT_PERMISSIONS");
  });

  it("allows an admin on the admin route", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/admin-check",
      headers: { authorization: "Bearer admin-token" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.role).toBe("admin");
  });

  it("maps an expired token to a safe 401", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: "Bearer expired-token" },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("EXPIRED_AUTH_TOKEN");
  });
});
