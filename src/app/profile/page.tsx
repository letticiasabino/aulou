import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AcademicDomainManager } from "@/features/academic/components/academic-domain-manager";

export default function ProfilePage() {
  return (
    <DashboardLayout title="Perfil acadêmico">
      <AcademicDomainManager />
    </DashboardLayout>
  );
}
