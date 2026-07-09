import { UserRound } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

export default function ProfilePage() {
  return (
    <DashboardLayout title="Perfil">
      <PlaceholderPage
        icon={UserRound}
        title="Perfil acadêmico"
        description="Perfil visual pronto para receber dados do usuário."
      />
    </DashboardLayout>
  );
}
