import { isSupabaseConfigured } from "@/lib/supabase/client";
import { academicFileMetadataSchema, validateAcademicFile } from "@/schemas/academic-file";
import { supabaseFilesRepository } from "@/services/files.supabase-repository";
import { storageService } from "@/services/storage.service";
import type { AcademicFile } from "@/types/academic-file";
import { analyticsService } from "@/services/analytics.service";

const localStorageKey = "aulou.academic-files";

function readAllLocal() {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem(localStorageKey) ?? "[]") as AcademicFile[];
}

function readLocal(userId: string) {
  return readAllLocal().filter((file) => file.userId === userId && file.status !== "deleted");
}

function writeLocal(files: AcademicFile[]) {
  window.localStorage.setItem(localStorageKey, JSON.stringify(files));
}

export const filesService = {
  list(userId: string) {
    return isSupabaseConfigured()
      ? supabaseFilesRepository.list(userId)
      : Promise.resolve(readLocal(userId));
  },

  async upload(userId: string, file: File) {
    analyticsService.identify(userId);
    analyticsService.track("upload_started", {
      userId,
      file_type: file.type,
      file_size_bytes: file.size,
    });
    const validated = validateAcademicFile(file);
    const fileId = crypto.randomUUID();
    const intent = await storageService.createUploadIntent({
      fileName: file.name,
      contentType: validated.contentType,
      size: validated.sizeBytes,
      userId,
      fileId,
    });
    const metadata = academicFileMetadataSchema.parse({
      id: fileId,
      userId,
      originalName: file.name,
      contentType: validated.contentType,
      sizeBytes: validated.sizeBytes,
      storageBucket: intent.bucket,
      storagePath: intent.storagePath,
      status: "uploaded",
    });
    const now = new Date().toISOString();
    const academicFile: AcademicFile = {
      ...metadata,
      extractionStatus: "pending",
      createdAt: now,
      updatedAt: now,
    };

    if (!isSupabaseConfigured()) {
      writeLocal([academicFile, ...readAllLocal()]);
      analyticsService.track("upload_completed", { userId, file_type: validated.contentType });
      return academicFile;
    }

    await supabaseFilesRepository.create(userId, metadata);
    try {
      await storageService.uploadAcademicFile({ userId, fileId, file });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha no upload.";
      await supabaseFilesRepository.updateStatus(userId, fileId, "failed", message);
      throw new Error(message);
    }
    analyticsService.track("upload_completed", { userId, file_type: validated.contentType });
    return academicFile;
  },
};
