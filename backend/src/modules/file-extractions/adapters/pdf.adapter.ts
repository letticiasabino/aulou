import path from "node:path";
import { pathToFileURL } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  EXTRACTION_LIMITS,
  ExtractionError,
  type AdapterOutput,
  type DocumentExtractionAdapter,
  type ExtractionInput,
} from "../extraction.types.js";

export class PdfExtractionAdapter implements DocumentExtractionAdapter {
  readonly name = "pdfjs";
  readonly contentTypes = ["application/pdf"] as const;

  async extract(input: ExtractionInput): Promise<AdapterOutput> {
    if (!input.buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
      throw new ExtractionError("corrupted", "O PDF esta corrompido ou possui formato invalido.");
    }
    let task: ReturnType<typeof getDocument> | undefined;
    try {
      task = getDocument({
        data: new Uint8Array(input.buffer),
        useWorkerFetch: false,
        disableFontFace: true,
        standardFontDataUrl: `${pathToFileURL(path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts")).href}/`,
      });
      const document = await task.promise;
      if (document.numPages > EXTRACTION_LIMITS.maxPdfPages) {
        throw new ExtractionError("limit_exceeded", "O PDF excede o limite de paginas.");
      }
      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push(
          content.items
            .flatMap((item) => ("str" in item && typeof item.str === "string" ? [item.str] : []))
            .join(" "),
        );
      }
      const text = pages.join("\n\n").trim();
      const probableScan = text.replace(/\s/g, "").length < Math.max(20, document.numPages * 10);
      return {
        status: probableScan ? "ocr_required" : "completed",
        text: probableScan ? undefined : text,
        structuredPayload: { kind: "pdf", probableScan },
        metrics: { pageCount: document.numPages, probableScan },
        warnings: probableScan ? ["PDF provavelmente escaneado; OCR necessario."] : [],
      };
    } catch (error) {
      if (error instanceof ExtractionError) throw error;
      throw new ExtractionError("corrupted", "Nao foi possivel ler o PDF.");
    } finally {
      await task?.destroy();
    }
  }
}
