export const EXTRACTION_LIMITS = {
  maxFileBytes: 10 * 1024 * 1024,
  maxTextChars: 1_000_000,
  maxPdfPages: 500,
  maxSpreadsheetRows: 50_000,
  maxSpreadsheetSheets: 100,
  maxColumns: 500,
} as const;

export type ExtractionStatus = "completed" | "ocr_required";

export type ExtractionInput = {
  buffer: Buffer;
  contentType: string;
  fileName: string;
};

export type AdapterOutput = {
  status?: ExtractionStatus;
  text?: string;
  structuredPayload?: Record<string, unknown>;
  metrics?: Record<string, number | string | boolean>;
  warnings?: string[];
};

export type ExtractionResult = {
  status: ExtractionStatus;
  rawText: string | null;
  adapter: string;
  structuredPayload: Record<string, unknown>;
  metrics: Record<string, number | string | boolean>;
  warnings: string[];
  normalizedCharCount: number;
  tokenCount: number;
  pageCount: number | null;
  sheetCount: number | null;
  rowCount: number | null;
};

export interface DocumentExtractionAdapter {
  readonly name: string;
  readonly contentTypes: readonly string[];
  extract(input: ExtractionInput): Promise<AdapterOutput>;
}

export class ExtractionError extends Error {
  constructor(
    public readonly kind: "corrupted" | "limit_exceeded" | "unsupported",
    message: string,
  ) {
    super(message);
    this.name = "ExtractionError";
  }
}
