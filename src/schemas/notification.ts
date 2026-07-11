import { z } from "zod";

export const academicNotificationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: z.enum(["deadline", "overdue", "exam", "study", "risk"]),
  title: z.string().min(1).max(160),
  message: z.string().min(1).max(500),
  severity: z.enum(["low", "moderate", "high", "critical"]),
  relatedEventId: z.string().optional(),
  relatedTaskId: z.string().optional(),
  scheduledFor: z.string().datetime(),
  readAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export const academicNotificationListSchema = z.array(academicNotificationSchema);
