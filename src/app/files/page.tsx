import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { FilesLibrary } from "@/features/files/components/files-library";

export default function FilesPage() {
  return (
    <DashboardLayout title="Arquivos">
      <FilesLibrary />
    </DashboardLayout>
  );
}
