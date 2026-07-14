import { XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import {
  EXTRACTION_LIMITS,
  ExtractionError,
  type AdapterOutput,
  type DocumentExtractionAdapter,
  type ExtractionInput,
} from "../extraction.types.js";

function asArray<T>(value: T | T[] | undefined): T[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

function columnIndex(reference: string): number {
  const letters = /^[A-Z]+/i.exec(reference)?.[0]?.toUpperCase() ?? "A";
  return [...letters].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function richText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  if (record.t !== undefined) return richText(record.t);
  return asArray(record.r).map(richText).join("");
}

export class XlsxExtractionAdapter implements DocumentExtractionAdapter {
  readonly name = "jszip-fast-xml-parser";
  readonly contentTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ] as const;

  async extract(input: ExtractionInput): Promise<AdapterOutput> {
    if (!input.buffer.subarray(0, 2).equals(Buffer.from("PK"))) {
      throw new ExtractionError("corrupted", "O XLSX esta corrompido ou possui formato invalido.");
    }
    try {
      const zip = await JSZip.loadAsync(input.buffer);
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
      const workbookXml = await zip.file("xl/workbook.xml")?.async("string");
      const relationshipsXml = await zip.file("xl/_rels/workbook.xml.rels")?.async("string");
      if (!workbookXml || !relationshipsXml) throw new Error("missing workbook metadata");
      const workbook = parser.parse(workbookXml) as Record<string, unknown>;
      const relationships = parser.parse(relationshipsXml) as Record<string, unknown>;
      const workbookNode = workbook.workbook as Record<string, unknown>;
      const sheetsNode = workbookNode.sheets as Record<string, unknown>;
      const sheetDefinitions = asArray(sheetsNode.sheet) as Array<Record<string, unknown>>;
      const relsNode = relationships.Relationships as Record<string, unknown>;
      const rels = asArray(relsNode.Relationship) as Array<Record<string, unknown>>;
      const targets = new Map(
        rels.map((relation) => [String(relation.Id), String(relation.Target)]),
      );
      const sharedXml = await zip.file("xl/sharedStrings.xml")?.async("string");
      const sharedStrings = sharedXml
        ? asArray(
            ((parser.parse(sharedXml) as Record<string, unknown>).sst as Record<string, unknown>)
              .si,
          ).map(richText)
        : [];
      if (sheetDefinitions.length > EXTRACTION_LIMITS.maxSpreadsheetSheets) {
        throw new ExtractionError("limit_exceeded", "A planilha excede o limite de abas.");
      }
      let rowCount = 0;
      const sheetNames: string[] = [];
      const blocks: string[] = [];
      for (const definition of sheetDefinitions) {
        const sheetName = String(definition.name);
        const target = targets.get(String(definition["r:id"]));
        if (!target) throw new Error("missing worksheet relationship");
        const path = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\//, "")}`;
        const sheetXml = await zip.file(path)?.async("string");
        if (!sheetXml) throw new Error("missing worksheet");
        const worksheet = parser.parse(sheetXml) as Record<string, unknown>;
        const worksheetNode = worksheet.worksheet as Record<string, unknown>;
        const sheetData = worksheetNode.sheetData as Record<string, unknown>;
        const rows = asArray(sheetData?.row) as Array<Record<string, unknown>>;
        rowCount += rows.length;
        if (rowCount > EXTRACTION_LIMITS.maxSpreadsheetRows) {
          throw new ExtractionError("limit_exceeded", "A planilha excede o limite de linhas.");
        }
        const lines = rows.map((row) => {
          const output: string[] = [];
          for (const cell of asArray(row.c) as Array<Record<string, unknown>>) {
            const index = columnIndex(String(cell.r ?? "A1"));
            if (index >= EXTRACTION_LIMITS.maxColumns) {
              throw new ExtractionError("limit_exceeded", "A planilha excede o limite de colunas.");
            }
            const value =
              cell.t === "inlineStr"
                ? richText(cell.is)
                : cell.t === "s"
                  ? (sharedStrings[Number(cell.v)] ?? "")
                  : cell.t === "b"
                    ? String(cell.v) === "1"
                      ? "true"
                      : "false"
                    : cell.v === undefined
                      ? ""
                      : String(cell.v);
            output[index] = value;
          }
          return Array.from({ length: output.length }, (_, index) => output[index] ?? "").join(
            "\t",
          );
        });
        sheetNames.push(sheetName);
        blocks.push([`# ${sheetName}`, ...lines].join("\n"));
      }
      return {
        text: blocks.join("\n\n"),
        structuredPayload: { kind: "xlsx", sheets: sheetNames },
        metrics: { sheetCount: sheetDefinitions.length, rowCount },
      };
    } catch (error) {
      if (error instanceof ExtractionError) throw error;
      throw new ExtractionError("corrupted", "Nao foi possivel ler o XLSX.");
    }
  }
}
