export const analyticsEventNames = [
  "signup_started",
  "signup_completed",
  "login_completed",
  "onboarding_completed",
  "upload_started",
  "upload_completed",
  "events_extracted",
  "events_confirmed",
  "summary_generated",
  "tutor_message_sent",
  "flashcards_generated",
  "quiz_started",
  "plan_created",
  "limit_reached",
  "upgrade_clicked",
  "subscription_started",
  "subscription_completed",
  "subscription_cancelled",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export interface AnalyticsEventRecord {
  id: string;
  name: AnalyticsEventName;
  userId: string | null;
  properties: Record<string, string | number | boolean | null>;
  occurredAt: string;
}

const funnelStages: AnalyticsEventName[] = [
  "signup_started",
  "signup_completed",
  "onboarding_completed",
  "upload_completed",
  "summary_generated",
  "upgrade_clicked",
  "subscription_completed",
];

export interface FunnelStage {
  name: AnalyticsEventName;
  users: number;
  conversionFromPrevious: number;
}

export class AnalyticsEngine {
  normalizeEventName(eventName: string) {
    return eventName.trim().toLowerCase().replace(/\s+/g, "_");
  }

  buildFunnel(events: AnalyticsEventRecord[]): FunnelStage[] {
    return funnelStages.map((name, index) => {
      const users = new Set<string>(
        events
          .filter((event) => event.name === name)
          .map((event) => event.userId)
          .filter((id): id is string => Boolean(id)),
      );
      const previousUsers = new Set<string>(
        events
          .filter((event) => event.name === funnelStages[index - 1])
          .map((event) => event.userId)
          .filter((id): id is string => Boolean(id)),
      );
      return {
        name,
        users: users.size,
        conversionFromPrevious:
          index === 0
            ? 0
            : previousUsers.size
              ? Math.round((users.size / previousUsers.size) * 100)
              : 0,
      };
    });
  }

  sanitizeProperties(properties: Record<string, unknown> = {}) {
    const blocked = /password|token|secret|content|message|question|answer|text|file_name/i;
    return Object.fromEntries(
      Object.entries(properties)
        .filter(
          ([key, value]) =>
            !blocked.test(key) &&
            (["string", "number", "boolean"].includes(typeof value) || value === null),
        )
        .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 120) : value]),
    ) as Record<string, string | number | boolean | null>;
  }
}

export const analyticsEngine = new AnalyticsEngine();
