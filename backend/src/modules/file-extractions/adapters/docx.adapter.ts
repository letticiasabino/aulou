import mammoth from "mammoth";
import {
  ExtractionError,
  type AdapterOutput,
  type DocumentExtractionAdapter,
  type ExtractionInput,
} from "../extraction.types.js";

export class DocxExtractionAdapter implements DocumentExtractionAdapter {
  readonly name = "mammoth";
  readonly contentTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const;

  async extract(input: ExtractionInput): Promise<AdapterOutput> {
    if (!input.buffer.subarray(0, 2).equals(Buffer.from("PK"))) {
      throw new ExtractionError("corrupted", "O DOCX esta corrompido ou possui formato invalido.");
    }
    try {
      const result = await mammoth.extractRawText({ buffer: input.buffer });
      return {
        text: result.value,
        structuredPayload: { kind: "docx" },
        warnings: result.messages.map((message) => message.message).slice(0, 20),
      };
    } catch {
      throw new ExtractionError("corrupted", "Nao foi possivel ler o DOCX.");
    }
  }
}
