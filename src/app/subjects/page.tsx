import { GraduationCap } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

export default function SubjectsPage() {
  return (
    <DashboardLayout title="Disciplinas">
      <PlaceholderPage
        icon={GraduationCap}
        title="Disciplinas"
        description="Cadastro acadêmico entra após a fundação técnica."
      />
    </DashboardLayout>
  );
}
