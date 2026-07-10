import { beforeEach, describe, expect, it } from "vitest";
import { filesService } from "@/services/files.service";

describe("filesService", () => {
  beforeEach(() => window.localStorage.clear());

  it("salva metadados no fallback local sem expor conteúdo do arquivo", async () => {
    const file = new File(["semestre,2026"], "cronograma.csv", { type: "text/csv" });
    const saved = await filesService.upload("user-1", file);
    const listed = await filesService.list("user-1");

    expect(saved.originalName).toBe("cronograma.csv");
    expect(saved.storagePath).toMatch(/^user-1\/.+\/cronograma\.csv$/);
    expect(saved.extractionStatus).toBe("pending");
    expect(listed).toHaveLength(1);
    expect(JSON.stringify(listed)).not.toContain("semestre,2026");
  });
});
