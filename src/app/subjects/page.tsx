import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SubjectsManager } from "@/features/academic/components/subjects-manager";

export default function SubjectsPage() {
  return (
    <DashboardLayout title="Disciplinas">
      <SubjectsManager />
    </DashboardLayout>
  );
}
