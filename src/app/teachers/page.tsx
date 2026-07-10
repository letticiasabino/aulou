import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { TeachersManager } from "@/features/academic/components/teachers-manager";

export default function TeachersPage() {
  return (
    <DashboardLayout title="Professores">
      <TeachersManager />
    </DashboardLayout>
  );
}
