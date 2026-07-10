import { describe, expect, it } from "vitest";
import {
  createAcademicStoragePath,
  sanitizeStorageFileName,
  storageService,
} from "@/services/storage.service";

describe("storageService", () => {
  it("normaliza nomes de arquivo para storage privado", () => {
    expect(sanitizeStorageFileName("Cronograma Álgebra 2026.pdf")).toBe(
      "cronograma-algebra-2026.pdf",
    );
  });

  it("cria path com userId e fileId como primeiras pastas", () => {
    expect(createAcademicStoragePath("user_1", "file_1", "Meu Cronograma.pdf")).toBe(
      "user_1/file_1/meu-cronograma.pdf",
    );
  });

  it("mantém intent local quando Supabase não está configurado", async () => {
    const intent = await storageService.createUploadIntent({
      fileName: "Cronograma.pdf",
      contentType: "application/pdf",
      size: 1024,
      userId: "user_1",
      fileId: "file_1",
    });

    expect(intent.bucket).toBe("academic-files");
    expect(intent.storagePath).toBe("user_1/file_1/cronograma.pdf");
    expect(intent.ready).toBe(false);
  });
});
