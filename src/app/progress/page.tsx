import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ProgressWorkspace } from "@/features/progress/components/progress-workspace";

export const metadata: Metadata = { title: "Saúde acadêmica" };
export default function ProgressPage() {
  return (
    <DashboardLayout title="Saúde acadêmica">
      <ProgressWorkspace />
    </DashboardLayout>
  );
}
