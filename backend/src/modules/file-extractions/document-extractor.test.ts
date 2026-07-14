import { Document, Packer, Paragraph } from "docx";
import { describe, expect, it } from "vitest";
import { DocumentExtractor } from "./document-extractor.js";
import { EXTRACTION_LIMITS, ExtractionError } from "./extraction.types.js";
import { createPdf, createXlsx } from "./test-fixtures.js";

const extractor = new DocumentExtractor();

describe("document extraction adapters", () => {
  it("extracts and normalizes textual PDF", async () => {
    const result = await extractor.extract({
      buffer: createPdf("Cronograma de Calculo com prova marcada para agosto"),
      contentType: "application/pdf",
      fileName: "cronograma.pdf",
    });
    expect(result.status).toBe("completed");
    expect(result.rawText).toContain("Cronograma de Calculo");
    expect(result.pageCount).toBe(1);
    expect(result.adapter).toBe("pdfjs");
  });

  it("classifies a PDF without a text layer as probably scanned", async () => {
    const result = await extractor.extract({
      buffer: createPdf(),
      contentType: "application/pdf",
      fileName: "scan.pdf",
    });
    expect(result.status).toBe("ocr_required");
    expect(result.rawText).toBeNull();
    expect(result.metrics.probableScan).toBe(true);
  });

  it("extracts DOCX text", async () => {
    const buffer = await Packer.toBuffer(
      new Document({ sections: [{ children: [new Paragraph("Plano de estudos semanal")] }] }),
    );
    const result = await extractor.extract({
      buffer,
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileName: "plano.docx",
    });
    expect(result.rawText).toBe("Plano de estudos semanal");
    expect(result.adapter).toBe("mammoth");
  });

  it("extracts all XLSX cells and metrics", async () => {
    const result = await extractor.extract({
      buffer: await createXlsx(),
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileName: "notas.xlsx",
    });
    expect(result.rawText).toContain("Disciplina\tNota");
    expect(result.rawText).toContain("Calculo\t9.5");
    expect(result.sheetCount).toBe(1);
    expect(result.rowCount).toBe(2);
  });

  it("parses quoted CSV and normalizes it to tabular text", async () => {
    const result = await extractor.extract({
      buffer: Buffer.from('nome,observacao\r\n"Ana","prova, trabalho"'),
      contentType: "text/csv",
      fileName: "agenda.csv",
    });
    expect(result.rawText).toBe("nome\tobservacao\nAna\tprova, trabalho");
    expect(result.rowCount).toBe(2);
  });

  it.each([
    ["image/png", Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])],
    ["image/jpeg", Buffer.from([0xff, 0xd8, 0xff, 0xd9])],
    ["image/webp", Buffer.from("RIFF0000WEBP")],
  ])("classifies %s as OCR required without running OCR", async (contentType, buffer) => {
    const result = await extractor.extract({ buffer, contentType, fileName: "imagem" });
    expect(result.status).toBe("ocr_required");
    expect(result.warnings[0]).toContain("nenhum OCR foi executado");
  });

  it("rejects a corrupted document with a safe error", async () => {
    await expect(
      extractor.extract({
        buffer: Buffer.from("%PDF-corrompido"),
        contentType: "application/pdf",
        fileName: "corrompido.pdf",
      }),
    ).rejects.toMatchObject({ kind: "corrupted" } satisfies Partial<ExtractionError>);
  });

  it("rejects a file above the extraction limit before selecting an adapter", async () => {
    await expect(
      extractor.extract({
        buffer: Buffer.alloc(EXTRACTION_LIMITS.maxFileBytes + 1),
        contentType: "application/pdf",
        fileName: "grande.pdf",
      }),
    ).rejects.toMatchObject({ kind: "limit_exceeded" } satisfies Partial<ExtractionError>);
  });

  it("rejects malformed CSV", async () => {
    await expect(
      extractor.extract({
        buffer: Buffer.from('nome,"aspas abertas'),
        contentType: "text/csv",
        fileName: "corrompido.csv",
      }),
    ).rejects.toMatchObject({ kind: "corrupted" } satisfies Partial<ExtractionError>);
  });
});
