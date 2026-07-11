import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { NotificationsWorkspace } from "@/features/notifications/components/notifications-workspace";

export const metadata: Metadata = { title: "Notificações" };
export default function NotificationsPage() {
  return (
    <DashboardLayout title="Notificações">
      <NotificationsWorkspace />
    </DashboardLayout>
  );
}
