import { Bot } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

export default function AIPage() {
  return (
    <DashboardLayout title="Tutor IA">
      <PlaceholderPage
        icon={Bot}
        title="Tutor IA"
        description="Provider abstrato já existe; a conversa contextual entra na Sprint 5."
      />
    </DashboardLayout>
  );
}
