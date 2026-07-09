import { describe, expect, it, vi } from "vitest";
import { analyticsService, setAnalyticsAdapter } from "@/services/analytics.service";

describe("analyticsService", () => {
  it("delega eventos para o adapter configurado", () => {
    const track = vi.fn();
    const identify = vi.fn();
    const page = vi.fn();
    const group = vi.fn();

    setAnalyticsAdapter({ track, identify, page, group });
    analyticsService.track("signup_started", { plan: "free" });
    analyticsService.identify("user_1");
    analyticsService.page("Landing");
    analyticsService.group("course_1");

    expect(track).toHaveBeenCalledWith("signup_started", { plan: "free" });
    expect(identify).toHaveBeenCalledWith("user_1", undefined);
    expect(page).toHaveBeenCalledWith("Landing", undefined);
    expect(group).toHaveBeenCalledWith("course_1", undefined);
  });
});
