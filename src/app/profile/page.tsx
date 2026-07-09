import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AcademicProfilePanel } from "@/features/academic/components/academic-profile-panel";

export default function ProfilePage() {
  return (
    <DashboardLayout title="Perfil">
      <AcademicProfilePanel />
    </DashboardLayout>
  );
}
