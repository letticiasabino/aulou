import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const academicFilesBucket = "academic-files";

export type UploadIntent = {
  fileName: string;
  contentType: string;
  size: number;
  userId?: string;
  fileId?: string;
};

export type UploadFileInput = {
  userId: string;
  fileId: string;
  file: File;
};

export function sanitizeStorageFileName(fileName: string) {
  const safeName = fileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return safeName || "arquivo";
}

export function createAcademicStoragePath(userId: string, fileId: string, fileName: string) {
  return `${userId}/${fileId}/${sanitizeStorageFileName(fileName)}`;
}

export const storageService = {
  async createUploadIntent(intent: UploadIntent) {
    const fileId = intent.fileId ?? crypto.randomUUID();
    const storagePath = intent.userId
      ? createAcademicStoragePath(intent.userId, fileId, intent.fileName)
      : `pending/${fileId}-${sanitizeStorageFileName(intent.fileName)}`;

    return {
      ...intent,
      fileId,
      bucket: academicFilesBucket,
      storagePath,
      ready: isSupabaseConfigured(),
    };
  },

  async uploadAcademicFile(input: UploadFileInput) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase Storage não está configurado.");
    }

    const supabase = createClient();
    const storagePath = createAcademicStoragePath(input.userId, input.fileId, input.file.name);
    const { error } = await supabase.storage
      .from(academicFilesBucket)
      .upload(storagePath, input.file, {
        contentType: input.file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    return {
      bucket: academicFilesBucket,
      storagePath,
    };
  },
};
