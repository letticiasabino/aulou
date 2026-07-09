import { HelpCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PlaceholderPage } from "@/features/dashboard/components/placeholder-page";

export default function QuizzesPage() {
  return (
    <DashboardLayout title="Quizzes">
      <PlaceholderPage
        icon={HelpCircle}
        title="Quizzes"
        description="Rota preparada para perguntas geradas por IA."
      />
    </DashboardLayout>
  );
}
