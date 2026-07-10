export const academicFileStatuses = [
  "uploaded",
  "processing",
  "processed",
  "failed",
  "deleted",
] as const;

export type AcademicFileStatus = (typeof academicFileStatuses)[number];

export type AcademicFile = {
  id: string;
  userId: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  storageBucket: string;
  storagePath: string;
  status: AcademicFileStatus;
  extractionStatus: "pending" | "processing" | "completed" | "failed";
  safeError?: string;
  createdAt: string;
  updatedAt: string;
};
