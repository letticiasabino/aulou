import { EXTRACTION_LIMITS, ExtractionError } from "./extraction.types.js";

export function normalizeExtractedText(value: string): string {
  const normalized = value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

  if (normalized.length > EXTRACTION_LIMITS.maxTextChars) {
    throw new ExtractionError("limit_exceeded", "O texto extraido excede o limite permitido.");
  }
  return normalized;
}
