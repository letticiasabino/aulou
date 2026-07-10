import { describe, expect, it } from "vitest";
import { MAX_ACADEMIC_FILE_SIZE_BYTES, validateAcademicFile } from "@/schemas/academic-file";

function makeFile(name: string, type: string, size: number) {
  return new File([new Uint8Array(size)], name, { type });
}

describe("academic file validation", () => {
  it("aceita formatos acadêmicos permitidos", () => {
    expect(
      validateAcademicFile(makeFile("cronograma.pdf", "application/pdf", 10)).contentType,
    ).toBe("application/pdf");
    expect(validateAcademicFile(makeFile("notas.csv", "text/csv", 10)).contentType).toBe(
      "text/csv",
    );
  });

  it("rejeita extensão desconhecida e MIME incompatível", () => {
    expect(() =>
      validateAcademicFile(makeFile("arquivo.exe", "application/octet-stream", 10)),
    ).toThrow("Formato não suportado");
    expect(() => validateAcademicFile(makeFile("cronograma.pdf", "image/png", 10))).toThrow(
      "não corresponde",
    );
  });

  it("rejeita arquivos vazios e acima do limite", () => {
    expect(() => validateAcademicFile(makeFile("vazio.txt", "text/plain", 0))).toThrow("vazio");
    expect(() =>
      validateAcademicFile(
        makeFile("grande.pdf", "application/pdf", MAX_ACADEMIC_FILE_SIZE_BYTES + 1),
      ),
    ).toThrow("10 MB");
  });
});
