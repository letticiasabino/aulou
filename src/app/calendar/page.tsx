import { CalendarDays } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

export default function CalendarPage() {
  return (
    <DashboardLayout title="Agenda">
      <PlaceholderPage
        icon={CalendarDays}
        title="Agenda em preparação"
        description="A estrutura da rota está pronta para receber eventos acadêmicos na Sprint 4."
      />
    </DashboardLayout>
  );
}
