import { FileUp } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

export default function FilesPage() {
  return (
    <DashboardLayout title="Arquivos">
      <PlaceholderPage
        icon={FileUp}
        title="Biblioteca de arquivos"
        description="Upload e storage serão ligados na Sprint 3."
      />
    </DashboardLayout>
  );
}
