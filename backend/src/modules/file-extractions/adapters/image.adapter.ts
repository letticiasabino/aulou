import {
  ExtractionError,
  type AdapterOutput,
  type DocumentExtractionAdapter,
  type ExtractionInput,
} from "../extraction.types.js";

function hasValidSignature(buffer: Buffer, contentType: string): boolean {
  if (contentType === "image/png")
    return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (contentType === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8;
  if (contentType === "image/webp")
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  return false;
}

export class ImageExtractionAdapter implements DocumentExtractionAdapter {
  readonly name = "image-classifier";
  readonly contentTypes = ["image/png", "image/jpeg", "image/webp"] as const;

  async extract(input: ExtractionInput): Promise<AdapterOutput> {
    if (!hasValidSignature(input.buffer, input.contentType)) {
      throw new ExtractionError(
        "corrupted",
        "A imagem esta corrompida ou possui formato invalido.",
      );
    }
    return {
      status: "ocr_required",
      structuredPayload: { kind: "image", reason: "ocr_required" },
      metrics: { ocrRequired: true },
      warnings: ["Imagem classificada para OCR futuro; nenhum OCR foi executado."],
    };
  }
}
