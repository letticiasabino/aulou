import { CsvExtractionAdapter } from "./adapters/csv.adapter.js";
import { DocxExtractionAdapter } from "./adapters/docx.adapter.js";
import { ImageExtractionAdapter } from "./adapters/image.adapter.js";
import { PdfExtractionAdapter } from "./adapters/pdf.adapter.js";
import { XlsxExtractionAdapter } from "./adapters/xlsx.adapter.js";
import {
  EXTRACTION_LIMITS,
  ExtractionError,
  type DocumentExtractionAdapter,
  type ExtractionInput,
  type ExtractionResult,
} from "./extraction.types.js";
import { normalizeExtractedText } from "./text-normalizer.js";

const defaultAdapters: readonly DocumentExtractionAdapter[] = [
  new PdfExtractionAdapter(),
  new DocxExtractionAdapter(),
  new XlsxExtractionAdapter(),
  new CsvExtractionAdapter(),
  new ImageExtractionAdapter(),
];

export class DocumentExtractor {
  constructor(private readonly adapters = defaultAdapters) {}

  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    if (input.buffer.length === 0) throw new ExtractionError("corrupted", "O arquivo esta vazio.");
    if (input.buffer.length > EXTRACTION_LIMITS.maxFileBytes) {
      throw new ExtractionError("limit_exceeded", "O arquivo excede o limite de 10 MB.");
    }
    const adapter = this.adapters.find((candidate) =>
      candidate.contentTypes.includes(input.contentType),
    );
    if (!adapter) throw new ExtractionError("unsupported", "Tipo de arquivo nao suportado.");

    const output = await adapter.extract(input);
    const rawText = output.text === undefined ? null : normalizeExtractedText(output.text);
    const status = output.status ?? "completed";
    if (status === "completed" && !rawText) {
      throw new ExtractionError("corrupted", "O documento nao possui texto extraivel.");
    }
    return {
      status,
      rawText,
      adapter: adapter.name,
      structuredPayload: output.structuredPayload ?? {},
      metrics: {
        ...(output.metrics ?? {}),
        bytes: input.buffer.length,
        chars: rawText?.length ?? 0,
      },
      warnings: output.warnings ?? [],
      normalizedCharCount: rawText?.length ?? 0,
      tokenCount: rawText ? Math.ceil(rawText.length / 4) : 0,
      pageCount: typeof output.metrics?.pageCount === "number" ? output.metrics.pageCount : null,
      sheetCount: typeof output.metrics?.sheetCount === "number" ? output.metrics.sheetCount : null,
      rowCount: typeof output.metrics?.rowCount === "number" ? output.metrics.rowCount : null,
    };
  }
}
