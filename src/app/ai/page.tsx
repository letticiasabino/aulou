import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { TutorWorkspace } from "@/features/ai/components/tutor-workspace";

export default function AIPage() {
  return (
    <DashboardLayout title="Tutor IA">
      <TutorWorkspace />
    </DashboardLayout>
  );
}
