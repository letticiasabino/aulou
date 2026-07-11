import {
  analyticsEngine,
  type AnalyticsEventName,
  type AnalyticsEventRecord,
} from "@/engines/analytics-engine";

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsAdapter {
  track: (event: string, properties?: AnalyticsProperties) => void;
  identify: (userId: string, properties?: AnalyticsProperties) => void;
  page: (name: string, properties?: AnalyticsProperties) => void;
  group: (groupId: string, properties?: AnalyticsProperties) => void;
}

const consoleAdapter: AnalyticsAdapter = {
  track(event, properties) {
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics.track]", event, properties ?? {});
    }
  },
  identify(userId, properties) {
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics.identify]", userId, properties ?? {});
    }
  },
  page(name, properties) {
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics.page]", name, properties ?? {});
    }
  },
  group(groupId, properties) {
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics.group]", groupId, properties ?? {});
    }
  },
};

let adapter: AnalyticsAdapter = consoleAdapter;
let currentUserId: string | null = null;
const storageKey = "studypilot.analytics.events";

function persistEvent(event: AnalyticsEventRecord) {
  if (typeof window === "undefined") return;
  const events = JSON.parse(
    window.localStorage.getItem(storageKey) ?? "[]",
  ) as AnalyticsEventRecord[];
  window.localStorage.setItem(storageKey, JSON.stringify([...events, event].slice(-1000)));
}

export function getStoredAnalyticsEvents(userId?: string) {
  if (typeof window === "undefined") return [];
  const events = JSON.parse(
    window.localStorage.getItem(storageKey) ?? "[]",
  ) as AnalyticsEventRecord[];
  return userId ? events.filter((event) => event.userId === userId) : events;
}

export function setAnalyticsAdapter(nextAdapter: AnalyticsAdapter) {
  adapter = nextAdapter;
}

export const analyticsService = {
  track: (event: AnalyticsEventName, properties?: AnalyticsProperties) => {
    const safeProperties = analyticsEngine.sanitizeProperties(properties);
    adapter.track(event, safeProperties);
    persistEvent({
      id: crypto.randomUUID(),
      name: event,
      userId: currentUserId,
      properties: safeProperties,
      occurredAt: new Date().toISOString(),
    });
  },
  identify: (userId: string, properties?: AnalyticsProperties) => {
    currentUserId = userId;
    adapter.identify(
      userId,
      properties ? analyticsEngine.sanitizeProperties(properties) : undefined,
    );
  },
  page: (name: string, properties?: AnalyticsProperties) => adapter.page(name, properties),
  group: (groupId: string, properties?: AnalyticsProperties) => adapter.group(groupId, properties),
};
