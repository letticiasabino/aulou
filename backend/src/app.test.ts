import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "./app.js";
import { parseEnv } from "./config/env.js";

const testEnv = parseEnv({ NODE_ENV: "test", FRONTEND_URL: "http://localhost:3000" });
let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp(testEnv);
});

afterAll(async () => {
  await app.close();
});

describe("foundation routes", () => {
  it("returns a safe health response", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      service: "aulou-api",
      version: "1.0.0",
      environment: "test",
    });
  });

  it("returns readiness without probing external services yet", async () => {
    const response = await app.inject({ method: "GET", url: "/ready" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "ready", checks: { configuration: "ok" } });
  });

  it("exposes OpenAPI routes", async () => {
    expect((await app.inject({ method: "GET", url: "/docs/json" })).statusCode).toBe(200);
    expect((await app.inject({ method: "GET", url: "/docs" })).statusCode).toBe(200);
  });

  it("documents academic request bodies in OpenAPI", async () => {
    const response = await app.inject({ method: "GET", url: "/docs/json" });
    const document = response.json();
    expect(
      document.paths["/v1/semesters"].post.requestBody.content["application/json"].schema.required,
    ).toEqual(["name", "startDate", "endDate"]);
    expect(
      document.paths["/v1/subjects"].post.requestBody.content["application/json"].schema.properties
        .semesterId.format,
    ).toBe("uuid");
    expect(
      document.paths["/v1/academic-events"].post.requestBody.content["application/json"].schema
        .properties.startAt.format,
    ).toBe("date-time");
    expect(document.paths["/v1/notifications"].get.security).toEqual([{ bearerAuth: [] }]);
    expect(document.paths["/v1/notifications/{notificationId}/read"].patch).toBeDefined();
    expect(document.paths["/v1/file-extractions"].post.security).toEqual([{ bearerAuth: [] }]);
    expect(document.paths["/v1/file-extractions/{id}/retry"].post).toBeDefined();
  });
});
