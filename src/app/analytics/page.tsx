import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AnalyticsWorkspace } from "@/features/analytics/components/analytics-workspace";

export const metadata: Metadata = { title: "Analytics" };
export default function AnalyticsPage() {
  return (
    <DashboardLayout title="Analytics">
      <AnalyticsWorkspace />
    </DashboardLayout>
  );
}
