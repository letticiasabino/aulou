import { createClient } from "@/lib/supabase/client";
import type { AcademicNotification } from "@/types/academic";

function assertResult(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

export const supabaseNotificationRepository = {
  async list(userId: string) {
    const result = await createClient()
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    assertResult(result.error, "Não foi possível carregar as notificações.");
    return (result.data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      severity: row.severity,
      relatedEventId: row.related_event_id ?? undefined,
      relatedTaskId: row.related_task_id ?? undefined,
      scheduledFor: row.scheduled_for,
      readAt: row.read_at ?? undefined,
      createdAt: row.created_at,
    })) as AcademicNotification[];
  },
  async saveMany(userId: string, notifications: AcademicNotification[]) {
    if (!notifications.length) return notifications;
    const result = await createClient()
      .from("notifications")
      .upsert(
        notifications.map((notification) => ({
          id: notification.id,
          user_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          severity: notification.severity,
          related_event_id: notification.relatedEventId ?? null,
          related_task_id: notification.relatedTaskId ?? null,
          scheduled_for: notification.scheduledFor,
          read_at: notification.readAt ?? null,
        })),
        { onConflict: "id" },
      );
    assertResult(result.error, "Não foi possível salvar as notificações.");
    return notifications;
  },
  async markRead(userId: string, id: string) {
    const result = await createClient()
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
    assertResult(result.error, "Não foi possível marcar a notificação.");
  },
};
