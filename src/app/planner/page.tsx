import { Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

export default function PlannerPage() {
  return (
    <DashboardLayout title="Plano de estudos">
      <PlaceholderPage
        icon={Sparkles}
        title="Plano de estudos"
        description="A PlanningEngine será conectada quando houver eventos reais."
      />
    </DashboardLayout>
  );
}
