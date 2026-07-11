import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { FlashcardsWorkspace } from "@/features/flashcards/components/flashcards-workspace";

export default function FlashcardsPage() {
  return (
    <DashboardLayout title="Flashcards">
      <FlashcardsWorkspace />
    </DashboardLayout>
  );
}
