import { describe, expect, it } from "vitest";
import { checkApiRequest } from "@/lib/api-security";

describe("api security", () => {
  it("rejeita payloads maiores que o limite", () => {
    const response = checkApiRequest(
      new Request("http://localhost", { headers: { "content-length": "25000" } }),
      "test-payload",
    );
    expect(response?.status).toBe(413);
  });
});
