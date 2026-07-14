export type BackgroundJobStatus = "pending" | "running" | "retry" | "completed" | "dead";
export type BackgroundJobType = "academic_event_reminder" | "file_extraction";

export type BackgroundJob = {
  id: string;
  user_id: string;
  type: BackgroundJobType;
  status: BackgroundJobStatus;
  payload: { eventId?: string; extractionId?: string; fileId?: string };
  attempts: number;
  max_attempts: number;
};
