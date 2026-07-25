import { describe, expect, it } from "vitest";
import { allowedUploadContentTypes, sanitizeFileName, uploadIntentSchema } from "./files.module.js";

describe("file upload contract", () => {
  it("accepts the documented file types and server-owned request shape", () => {
    for (const contentType of allowedUploadContentTypes) {
      expect(
        uploadIntentSchema.parse({ filename: "material.pdf", contentType, sizeBytes: 1 })
          .contentType,
      ).toBe(contentType);
    }
    expect(() =>
      uploadIntentSchema.parse({ filename: "x", contentType: "text/plain", sizeBytes: 1 }),
    ).toThrow();
    expect(() =>
      uploadIntentSchema.parse({
        filename: "x",
        contentType: "text/csv",
        sizeBytes: 10 * 1024 * 1024 + 1,
      }),
    ).toThrow();
    expect(() =>
      uploadIntentSchema.parse({ filename: "x", contentType: "text/csv", sizeBytes: 0 }),
    ).toThrow();
    expect(() =>
      uploadIntentSchema.parse({
        filename: "x",
        contentType: "text/csv",
        sizeBytes: 1,
        user_id: "forged",
      }),
    ).toThrow();
  });

  it("normalizes names and removes traversal separators", () => {
    expect(sanitizeFileName("../aula final?.pdf")).toBe("..-aula-final-.pdf");
    expect(sanitizeFileName("pasta\\arquivo.csv")).toBe("pasta-arquivo.csv");
    expect(() => sanitizeFileName("..")).toThrow();
  });
});
