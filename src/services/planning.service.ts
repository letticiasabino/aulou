import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  generateStudyPlan,
  replanOverdueTasks,
  type PlanningInput,
} from "@/engines/planning-engine";
import { supabasePlanningRepository } from "@/services/planning.supabase-repository";
import type { StudyPlan, StudyTask } from "@/types/academic";

const localStorageKey = "aulou.study-plans";

function readLocal(userId: string) {
  if (typeof window === "undefined") return [];
  return (JSON.parse(window.localStorage.getItem(localStorageKey) ?? "[]") as StudyPlan[]).filter(
    (plan) => plan.userId === userId && plan.status === "active",
  );
}

function writeLocal(plans: StudyPlan[]) {
  window.localStorage.setItem(localStorageKey, JSON.stringify(plans));
}

export const planningService = {
  async create(userId: string, input: Omit<PlanningInput, "userId">) {
    const plan = generateStudyPlan({ ...input, userId });
    if (isSupabaseConfigured()) return supabasePlanningRepository.save(userId, plan);
    const next = [plan, ...readLocal(userId).filter((current) => current.id !== plan.id)];
    writeLocal(next);
    return plan;
  },

  async latest(userId: string) {
    if (isSupabaseConfigured()) return supabasePlanningRepository.latest(userId);
    return readLocal(userId)[0] ?? null;
  },

  async replan(plan: StudyPlan, now = new Date()) {
    const replanned = replanOverdueTasks(plan, now);
    if (isSupabaseConfigured()) return supabasePlanningRepository.save(plan.userId, replanned);
    writeLocal([replanned, ...readLocal(plan.userId).filter((current) => current.id !== plan.id)]);
    return replanned;
  },

  async updateTask(userId: string, plan: StudyPlan, taskId: string, status: StudyTask["status"]) {
    if (isSupabaseConfigured()) {
      await supabasePlanningRepository.updateTask(userId, taskId, status);
      return supabasePlanningRepository.latest(userId);
    }
    const tasks = plan.tasks.map((task) => (task.id === taskId ? { ...task, status } : task));
    const next: StudyPlan = {
      ...plan,
      tasks,
      days: plan.days.map((day) => ({
        ...day,
        tasks: tasks.filter((task) => task.scheduledFor === day.date),
      })),
      updatedAt: new Date().toISOString(),
    };
    writeLocal([next, ...readLocal(userId).filter((current) => current.id !== plan.id)]);
    return next;
  },
};
