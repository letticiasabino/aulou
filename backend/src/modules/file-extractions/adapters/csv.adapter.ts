import {
  EXTRACTION_LIMITS,
  ExtractionError,
  type AdapterOutput,
  type DocumentExtractionAdapter,
  type ExtractionInput,
} from "../extraction.types.js";

function detectDelimiter(text: string): string {
  const sample = text.split(/\r?\n/, 1)[0] ?? "";
  const candidates = [",", ";", "\t"];
  return candidates.sort(
    (left, right) => sample.split(right).length - sample.split(left).length,
  )[0];
}

export function parseCsv(text: string, delimiter = detectDelimiter(text)): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += character;
  }
  if (quoted) throw new ExtractionError("corrupted", "O CSV possui aspas nao encerradas.");
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export class CsvExtractionAdapter implements DocumentExtractionAdapter {
  readonly name = "csv";
  readonly contentTypes = ["text/csv"] as const;

  async extract(input: ExtractionInput): Promise<AdapterOutput> {
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(input.buffer);
    } catch {
      throw new ExtractionError("corrupted", "O CSV nao esta em UTF-8 valido.");
    }
    const delimiter = detectDelimiter(text);
    const rows = parseCsv(text, delimiter);
    if (rows.length > EXTRACTION_LIMITS.maxSpreadsheetRows) {
      throw new ExtractionError("limit_exceeded", "O CSV excede o limite de linhas.");
    }
    if (rows.some((row) => row.length > EXTRACTION_LIMITS.maxColumns)) {
      throw new ExtractionError("limit_exceeded", "O CSV excede o limite de colunas.");
    }
    return {
      text: rows.map((row) => row.join("\t")).join("\n"),
      structuredPayload: { kind: "csv", delimiter, columns: rows[0] ?? [] },
      metrics: { rowCount: rows.length },
    };
  }
}
