import { createClient } from "@/lib/supabase/client";
import type { FileExtractionRow, FileRow } from "@/types/database.types";
import type { AcademicFile } from "@/types/academic-file";

function mapFile(row: FileRow, extraction: FileExtractionRow | null): AcademicFile {
  return {
    id: row.id,
    userId: row.user_id,
    originalName: row.original_name,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    status: row.status,
    extractionStatus: extraction?.status ?? "pending",
    safeError: extraction?.safe_error ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assertResult(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

export const supabaseFilesRepository = {
  async list(userId: string) {
    const supabase = createClient();
    const filesResult = await supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "deleted")
      .order("created_at", { ascending: false });
    assertResult(filesResult.error, "Não foi possível carregar os arquivos.");
    const files = filesResult.data ?? [];
    const extractionsResult = files.length
      ? await supabase.from("file_extractions").select("*").eq("user_id", userId)
      : { data: [], error: null };
    assertResult(extractionsResult.error, "Não foi possível carregar o processamento.");
    const extractions = new Map(
      (extractionsResult.data ?? []).map((extraction) => [extraction.file_id, extraction]),
    );
    return files.map((file) => mapFile(file, extractions.get(file.id) ?? null));
  },

  async create(
    userId: string,
    file: Omit<AcademicFile, "createdAt" | "updatedAt" | "extractionStatus">,
  ) {
    const supabase = createClient();
    const result = await supabase.from("files").insert({
      id: file.id,
      user_id: userId,
      storage_bucket: file.storageBucket,
      storage_path: file.storagePath,
      original_name: file.originalName,
      content_type: file.contentType,
      size_bytes: file.sizeBytes,
      status: file.status,
    });
    assertResult(result.error, "Não foi possível registrar o arquivo.");
    const extractionResult = await supabase
      .from("file_extractions")
      .insert({ user_id: userId, file_id: file.id, status: "pending", provider: "mock" });
    assertResult(extractionResult.error, "Não foi possível registrar o processamento.");
  },

  async updateStatus(
    userId: string,
    fileId: string,
    status: AcademicFile["status"],
    safeError?: string,
  ) {
    const supabase = createClient();
    const fileResult = await supabase
      .from("files")
      .update({ status })
      .eq("id", fileId)
      .eq("user_id", userId);
    assertResult(fileResult.error, "Não foi possível atualizar o arquivo.");
    if (safeError) {
      const extractionResult = await supabase
        .from("file_extractions")
        .update({ status: "failed", safe_error: safeError })
        .eq("file_id", fileId)
        .eq("user_id", userId);
      assertResult(extractionResult.error, "Não foi possível registrar o erro de processamento.");
    }
  },
};
