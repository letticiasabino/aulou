import type { SupabaseClient } from "@supabase/supabase-js";
import type { EmailIntegration } from "../integrations/email/email.client.js";
import type { BackgroundJob } from "./job.types.js";
import type { JobHandler } from "./job-handler.js";

type AcademicEvent = {
  id: string;
  user_id: string;
  title: string;
  event_type: string;
  start_at: string;
  status: string;
};

export function buildEventNotification(event: AcademicEvent, now = new Date()) {
  const overdue = new Date(event.start_at).getTime() < now.getTime();
  const type = overdue ? "overdue" : event.event_type === "exam" ? "exam" : "deadline";
  const title = overdue
    ? "Evento vencido"
    : event.event_type === "exam"
      ? "Prova se aproximando"
      : "Prazo se aproximando";
  return {
    id: `${type}:${event.id}`,
    type,
    title,
    message: overdue ? `${event.title} precisa de atenção.` : `${event.title} acontece em breve.`,
    severity: overdue || event.event_type === "exam" ? "high" : "moderate",
  } as const;
}

export class NotificationJobHandler implements JobHandler {
  readonly jobType = "academic_event_reminder" as const;
  constructor(
    private readonly client: SupabaseClient,
    private readonly email: EmailIntegration,
  ) {}

  async handle(job: BackgroundJob, now = new Date()): Promise<Record<string, unknown>> {
    if (job.type !== "academic_event_reminder")
      throw new Error(`Unsupported job type: ${job.type as string}`);
    const eventResult = await this.client
      .from("academic_events")
      .select("id,user_id,title,event_type,start_at,status")
      .eq("id", job.payload.eventId ?? "")
      .eq("user_id", job.user_id)
      .maybeSingle();
    if (eventResult.error)
      throw new Error(`Could not load academic event: ${eventResult.error.message}`);
    if (
      !eventResult.data ||
      ["completed", "cancelled", "archived"].includes(String(eventResult.data.status))
    )
      return { skipped: "event_unavailable" };

    const event = eventResult.data as AcademicEvent;
    const built = buildEventNotification(event, now);
    const notificationId = built.id;
    const notification = await this.client.from("notifications").upsert(
      {
        id: notificationId,
        user_id: event.user_id,
        type: built.type,
        title: built.title,
        message: built.message,
        severity: built.severity,
        related_event_id: event.id,
        scheduled_for: event.start_at,
      },
      { onConflict: "id" },
    );
    if (notification.error)
      throw new Error(`Could not persist notification: ${notification.error.message}`);

    if (!this.email.configured) return { notificationId, email: "disabled" };
    const user = await this.client.auth.admin.getUserById(event.user_id);
    if (user.error)
      throw new Error(`Could not resolve notification recipient: ${user.error.message}`);
    if (!user.data.user.email) return { notificationId, email: "no_recipient" };
    const sent = await this.email.sendNotification({
      to: user.data.user.email,
      title: built.title,
      message: built.message,
      idempotencyKey: `aulou-${job.id}-${event.start_at}`,
    });
    return { notificationId, email: sent?.id ?? "disabled" };
  }
}
