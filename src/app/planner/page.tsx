import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PlannerWorkspace } from "@/features/planner/components/planner-workspace";

export default function PlannerPage() {
  return (
    <DashboardLayout title="Plano de estudos">
      <PlannerWorkspace />
    </DashboardLayout>
  );
}
