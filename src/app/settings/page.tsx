import { Settings } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

export default function SettingsPage() {
  return (
    <DashboardLayout title="Configurações">
      <PlaceholderPage
        icon={Settings}
        title="Configurações"
        description="Tema, notificações, privacidade e plano serão ligados gradualmente."
      />
    </DashboardLayout>
  );
}
