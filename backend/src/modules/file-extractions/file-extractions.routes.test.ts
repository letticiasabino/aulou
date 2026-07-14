import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { parseEnv } from "../../config/env.js";
import type { Authenticator, AuthenticatedUser } from "../../shared/auth/auth.types.js";

const userA: AuthenticatedUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "a@aulou.test",
  role: "student",
};
const userB: AuthenticatedUser = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "b@aulou.test",
  role: "student",
};
const fileId = "33333333-3333-4333-8333-333333333333";
const extractionId = "44444444-4444-4444-8444-444444444444";
const extraction = {
  id: extractionId,
  user_id: userA.id,
  file_id: fileId,
  status: "failed",
  provider: "local",
  adapter: null,
  raw_text: null,
  structured_payload: {},
  safe_error: "Falha anterior.",
  token_count: null,
  normalized_char_count: null,
  page_count: null,
  sheet_count: null,
  row_count: null,
  metrics: {},
  warnings: [],
  started_at: null,
  completed_at: null,
  created_at: "2026-07-14T12:00:00Z",
  updated_at: "2026-07-14T12:00:00Z",
};
const requests = new Map<string, Record<string, unknown>>();

class RouteQuery {
  private filters = new Map<string, unknown>();
  constructor(
    private readonly table: string,
    private readonly userId: string,
  ) {}
  select() {
    return this;
  }
  eq(column: string, value: unknown) {
    this.filters.set(column, value);
    return this;
  }
  neq() {
    return this;
  }
  maybeSingle() {
    if (this.table === "files") {
      const allowed = this.userId === userA.id && this.filters.get("id") === fileId;
      return Promise.resolve({
        data: allowed ? { id: fileId, size_bytes: 1024, status: "uploaded" } : null,
        error: null,
      });
    }
    const allowed =
      this.userId === userA.id &&
      this.filters.get("id") === extractionId &&
      this.filters.get("user_id") === userA.id;
    return Promise.resolve({ data: allowed ? extraction : null, error: null });
  }
}

function routeClient(userId: string): SupabaseClient {
  return {
    from(table: string) {
      return new RouteQuery(table, userId);
    },
    async rpc(name: string, parameters: Record<string, unknown>) {
      if (name === "request_file_extraction") {
        const key = `${userId}:${String(parameters.requested_key)}`;
        const value = requests.get(key) ?? { ...extraction, status: "pending", safe_error: null };
        requests.set(key, value);
        return { data: value, error: null };
      }
      if (name === "retry_file_extraction") {
        return { data: { ...extraction, status: "pending", safe_error: null }, error: null };
      }
      return { data: null, error: { code: "unknown" } };
    },
  } as unknown as SupabaseClient;
}

const authenticator: Authenticator = {
  async authenticate(token) {
    if (token === "user-a") return userA;
    if (token === "user-b") return userB;
    throw new Error("invalid token");
  },
  createClient(token) {
    return routeClient(token === "user-a" ? userA.id : userB.id);
  },
};

const app = await buildApp(parseEnv({ NODE_ENV: "test", FRONTEND_URL: "http://localhost:3000" }), {
  authenticator,
});
beforeAll(async () => app.ready());
afterAll(async () => app.close());

describe("file extraction routes", () => {
  it("keeps extraction results isolated between user A and user B", async () => {
    const responseA = await app.inject({
      method: "GET",
      url: `/v1/file-extractions/${extractionId}`,
      headers: { authorization: "Bearer user-a" },
    });
    const responseB = await app.inject({
      method: "GET",
      url: `/v1/file-extractions/${extractionId}`,
      headers: { authorization: "Bearer user-b" },
    });
    expect(responseA.statusCode).toBe(200);
    expect(responseA.json().data.id).toBe(extractionId);
    expect(responseB.statusCode).toBe(404);
  });

  it("returns the same extraction for the same idempotency key", async () => {
    const request = {
      method: "POST" as const,
      url: "/v1/file-extractions",
      headers: { authorization: "Bearer user-a", "idempotency-key": "upload-123" },
      payload: { fileId },
    };
    const first = await app.inject(request);
    const second = await app.inject(request);
    expect(first.statusCode).toBe(202);
    expect(second.statusCode).toBe(202);
    expect(first.json().data.id).toBe(second.json().data.id);
    expect(requests.size).toBe(1);
  });

  it("retries only an owned failed extraction and returns pending", async () => {
    const response = await app.inject({
      method: "POST",
      url: `/v1/file-extractions/${extractionId}/retry`,
      headers: { authorization: "Bearer user-a" },
    });
    expect(response.statusCode).toBe(202);
    expect(response.json().data.status).toBe("pending");
  });

  it("returns 422 for invalid extraction input", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/file-extractions",
      headers: { authorization: "Bearer user-a" },
      payload: { fileId: "not-a-uuid", user_id: userB.id },
    });
    expect(response.statusCode).toBe(422);
    expect(response.json().error.code).toBe("VALIDATION_ERROR");
  });
});
