import { createClient } from "@/lib/supabase/client";
import type { StudyDay, StudyPlan, StudyTask } from "@/types/academic";
import type { StudyPlanRow, StudyTaskRow } from "@/types/database.types";

function assertResult(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

function mapPlan(row: StudyPlanRow, taskRows: StudyTaskRow[]): StudyPlan {
  const tasks = taskRows.map<StudyTask>((task) => ({
    id: task.id,
    eventId: task.event_id,
    title: task.title,
    dueAt: task.due_at,
    estimatedMinutes: task.estimated_minutes,
    priority: task.priority,
    status: task.status,
    scheduledFor: task.scheduled_for,
    subjectName: task.subject_name ?? undefined,
    overdue: task.overdue,
  }));
  const dayMap = new Map<string, StudyDay>();
  const start = new Date(`${row.period_start}T00:00:00.000Z`);
  const end = new Date(`${row.period_end}T00:00:00.000Z`);
  for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10);
    const availability =
      typeof row.availability_by_weekday === "object" &&
      row.availability_by_weekday &&
      !Array.isArray(row.availability_by_weekday)
        ? Number(
            (row.availability_by_weekday as Record<string, JsonValue>)[
              String(cursor.getUTCDay())
            ] ?? row.available_minutes_per_day,
          )
        : row.available_minutes_per_day;
    const dayTasks = tasks.filter((task) => task.scheduledFor === date);
    dayMap.set(date, {
      date,
      availableMinutes: availability,
      plannedMinutes: dayTasks.reduce((sum, task) => sum + task.estimatedMinutes, 0),
      tasks: dayTasks,
    });
  }
  return {
    id: row.id,
    userId: row.user_id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    availableMinutesPerDay: row.available_minutes_per_day,
    availabilityByWeekday: row.availability_by_weekday as StudyPlan["availabilityByWeekday"],
    tasks,
    days: [...dayMap.values()],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export const supabasePlanningRepository = {
  async save(userId: string, plan: StudyPlan) {
    const supabase = createClient();
    const planResult = await supabase.from("study_plans").upsert(
      {
        id: plan.id,
        user_id: userId,
        period_start: plan.periodStart,
        period_end: plan.periodEnd,
        available_minutes_per_day: plan.availableMinutesPerDay,
        availability_by_weekday: plan.availabilityByWeekday ?? {},
        status: plan.status,
      },
      { onConflict: "id" },
    );
    assertResult(planResult.error, "Não foi possível salvar o plano.");
    const deleteResult = await supabase
      .from("study_tasks")
      .delete()
      .eq("plan_id", plan.id)
      .eq("user_id", userId);
    assertResult(deleteResult.error, "Não foi possível atualizar as tarefas.");
    if (plan.tasks.length) {
      const taskResult = await supabase.from("study_tasks").insert(
        plan.tasks.map((task) => ({
          id: task.id,
          user_id: userId,
          plan_id: plan.id,
          event_id: task.eventId,
          title: task.title,
          subject_name: task.subjectName ?? null,
          scheduled_for: task.scheduledFor ?? plan.periodStart,
          due_at: task.dueAt,
          estimated_minutes: task.estimatedMinutes,
          priority: task.priority,
          status: task.status,
          overdue: task.overdue ?? false,
        })),
      );
      assertResult(taskResult.error, "Não foi possível salvar as tarefas.");
    }
    return plan;
  },

  async latest(userId: string) {
    const supabase = createClient();
    const planResult = await supabase
      .from("study_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    assertResult(planResult.error, "Não foi possível carregar o plano.");
    if (!planResult.data) return null;
    const tasksResult = await supabase
      .from("study_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", planResult.data.id)
      .order("scheduled_for");
    assertResult(tasksResult.error, "Não foi possível carregar as tarefas.");
    return mapPlan(planResult.data, tasksResult.data ?? []);
  },

  async updateTask(userId: string, taskId: string, status: StudyTask["status"]) {
    const supabase = createClient();
    const result = await supabase
      .from("study_tasks")
      .update({ status })
      .eq("id", taskId)
      .eq("user_id", userId);
    assertResult(result.error, "Não foi possível atualizar a tarefa.");
  },
};
