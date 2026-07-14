import type { SupabaseClient } from "@supabase/supabase-js";
import { DocumentExtractor } from "../modules/file-extractions/document-extractor.js";
import { ExtractionError } from "../modules/file-extractions/extraction.types.js";
import type { JobHandler } from "./job-handler.js";
import type { BackgroundJob } from "./job.types.js";

type FileRow = {
  id: string;
  user_id: string;
  storage_bucket: string;
  storage_path: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  status: string;
};

export class FileExtractionJobHandler implements JobHandler {
  readonly jobType = "file_extraction" as const;

  constructor(
    private readonly client: SupabaseClient,
    private readonly extractor: Pick<DocumentExtractor, "extract"> = new DocumentExtractor(),
  ) {}

  async handle(job: BackgroundJob): Promise<Record<string, unknown>> {
    const processingStartedAt = Date.now();
    const extractionId = job.payload.extractionId;
    const fileId = job.payload.fileId;
    if (!extractionId || !fileId) throw new Error("Invalid file extraction job payload.");

    const extractionResult = await this.client
      .from("file_extractions")
      .update({
        status: "processing",
        safe_error: null,
        started_at: new Date().toISOString(),
        completed_at: null,
      })
      .eq("id", extractionId)
      .eq("file_id", fileId)
      .eq("user_id", job.user_id)
      .select("id,file_id,user_id")
      .maybeSingle();
    if (extractionResult.error)
      throw new Error(`Could not start file extraction: ${extractionResult.error.message}`);
    if (!extractionResult.data) throw new Error("File extraction not found for job owner.");

    try {
      const fileResult = await this.client
        .from("files")
        .select(
          "id,user_id,storage_bucket,storage_path,original_name,content_type,size_bytes,status",
        )
        .eq("id", fileId)
        .eq("user_id", job.user_id)
        .neq("status", "deleted")
        .maybeSingle();
      if (fileResult.error) throw new Error(`Could not load file: ${fileResult.error.message}`);
      if (!fileResult.data) throw new Error("File not found for extraction owner.");
      const file = fileResult.data as FileRow;
      const download = await this.client.storage
        .from(file.storage_bucket)
        .download(file.storage_path);
      if (download.error) throw new Error(`Could not download file: ${download.error.message}`);
      const buffer = Buffer.from(await download.data.arrayBuffer());
      if (buffer.length !== Number(file.size_bytes)) {
        throw new ExtractionError("corrupted", "O tamanho armazenado do arquivo nao confere.");
      }

      const result = await this.extractor.extract({
        buffer,
        contentType: file.content_type,
        fileName: file.original_name,
      });
      const completedAt = new Date().toISOString();
      const metrics = { ...result.metrics, durationMs: Date.now() - processingStartedAt };
      const persisted = await this.client
        .from("file_extractions")
        .update({
          status: result.status,
          raw_text: result.rawText,
          structured_payload: result.structuredPayload,
          provider: "local",
          adapter: result.adapter,
          safe_error: null,
          token_count: result.tokenCount,
          normalized_char_count: result.normalizedCharCount,
          page_count: result.pageCount,
          sheet_count: result.sheetCount,
          row_count: result.rowCount,
          metrics,
          warnings: result.warnings,
          completed_at: completedAt,
        })
        .eq("id", extractionId)
        .eq("user_id", job.user_id);
      if (persisted.error)
        throw new Error(`Could not persist extraction result: ${persisted.error.message}`);
      const fileUpdate = await this.client
        .from("files")
        .update({ status: "processed" })
        .eq("id", fileId)
        .eq("user_id", job.user_id);
      if (fileUpdate.error)
        throw new Error(`Could not update extracted file: ${fileUpdate.error.message}`);
      return {
        extractionId,
        fileId,
        status: result.status,
        adapter: result.adapter,
        metrics,
      };
    } catch (error) {
      const safeError =
        error instanceof ExtractionError ? error.message : "Falha ao extrair o documento.";
      await this.client
        .from("file_extractions")
        .update({ status: "failed", safe_error: safeError, completed_at: new Date().toISOString() })
        .eq("id", extractionId)
        .eq("user_id", job.user_id);
      throw error;
    }
  }
}
