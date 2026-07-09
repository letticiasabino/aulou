export class AnalyticsEngine {
  normalizeEventName(eventName: string) {
    return eventName.trim().toLowerCase().replace(/\s+/g, "_");
  }
}
