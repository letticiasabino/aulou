import { buildNotifications } from "@/engines/notification-engine";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { academicNotificationListSchema } from "@/schemas/notification";
import { supabaseNotificationRepository } from "@/services/notification.supabase-repository";
import type { AcademicEvent, AcademicNotification, StudyTask } from "@/types/academic";

const localStorageKey = "aulou.notifications";

function readLocal(userId: string) {
  if (typeof window === "undefined") return [];
  const parsed = academicNotificationListSchema.safeParse(
    JSON.parse(window.localStorage.getItem(localStorageKey) ?? "[]"),
  );
  return parsed.success ? parsed.data.filter((notification) => notification.userId === userId) : [];
}

function writeLocal(notifications: AcademicNotification[]) {
  window.localStorage.setItem(localStorageKey, JSON.stringify(notifications));
}

export const notificationService = {
  async list(userId: string) {
    if (isSupabaseConfigured()) return supabaseNotificationRepository.list(userId);
    return readLocal(userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async refresh(userId: string, events: AcademicEvent[], tasks: StudyTask[], now = new Date()) {
    const generated = buildNotifications({ userId, events, tasks, now });
    if (isSupabaseConfigured()) {
      await supabaseNotificationRepository.saveMany(userId, generated);
      return supabaseNotificationRepository.list(userId);
    }
    const current = readLocal(userId);
    const next = [
      ...generated,
      ...current.filter((item) => !generated.some((candidate) => candidate.id === item.id)),
    ];
    writeLocal(next);
    return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async markRead(userId: string, id: string) {
    if (isSupabaseConfigured()) {
      await supabaseNotificationRepository.markRead(userId, id);
      return;
    }
    writeLocal(
      readLocal(userId).map((notification) =>
        notification.id === id
          ? { ...notification, readAt: new Date().toISOString() }
          : notification,
      ),
    );
  },
};
