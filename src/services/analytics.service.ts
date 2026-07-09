type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

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

export function setAnalyticsAdapter(nextAdapter: AnalyticsAdapter) {
  adapter = nextAdapter;
}

export const analyticsService = {
  track: (event: string, properties?: AnalyticsProperties) => adapter.track(event, properties),
  identify: (userId: string, properties?: AnalyticsProperties) =>
    adapter.identify(userId, properties),
  page: (name: string, properties?: AnalyticsProperties) => adapter.page(name, properties),
  group: (groupId: string, properties?: AnalyticsProperties) => adapter.group(groupId, properties),
};
