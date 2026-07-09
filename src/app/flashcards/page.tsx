import { Library } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

export default function FlashcardsPage() {
  return (
    <DashboardLayout title="Flashcards">
      <PlaceholderPage
        icon={Library}
        title="Flashcards"
        description="Base pronta para gerar cartões a partir dos materiais."
      />
    </DashboardLayout>
  );
}
