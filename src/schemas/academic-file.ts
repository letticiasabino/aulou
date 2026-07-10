import { z } from "zod";

export const MAX_ACADEMIC_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const allowedAcademicFileTypes = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".csv": "text/csv",
  ".txt": "text/plain",
} as const;

export const academicFileMetadataSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  originalName: z.string().trim().min(1).max(255),
  contentType: z.string().min(1).max(150),
  sizeBytes: z.number().int().positive().max(MAX_ACADEMIC_FILE_SIZE_BYTES),
  storageBucket: z.literal("academic-files"),
  storagePath: z.string().regex(/^[^/]+\/[^/]+\/[^/]+$/),
  status: z.enum(["uploaded", "processing", "processed", "failed", "deleted"]),
});

function fileExtension(fileName: string) {
  const normalized = fileName.toLowerCase();
  const dotIndex = normalized.lastIndexOf(".");
  return dotIndex >= 0 ? normalized.slice(dotIndex) : "";
}

export function validateAcademicFile(file: File) {
  if (file.size <= 0) throw new Error("O arquivo está vazio.");
  if (file.size > MAX_ACADEMIC_FILE_SIZE_BYTES)
    throw new Error("O arquivo deve ter no máximo 10 MB.");

  const extension = fileExtension(file.name) as keyof typeof allowedAcademicFileTypes;
  const expectedType = allowedAcademicFileTypes[extension];
  if (!expectedType)
    throw new Error("Formato não suportado. Envie PDF, imagem, DOCX, XLSX, CSV ou TXT.");
  if (file.type && file.type !== expectedType)
    throw new Error("O tipo informado pelo arquivo não corresponde à extensão.");

  return { extension, contentType: expectedType, sizeBytes: file.size };
}

export function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
