import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { FeedbackWorkspace } from "@/features/feedback/components/feedback-workspace";

export const metadata: Metadata = { title: "Enviar feedback" };
export default function FeedbackPage() {
  return (
    <DashboardLayout title="Feedback">
      <FeedbackWorkspace />
    </DashboardLayout>
  );
}
