import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AcademicDashboard } from "@/features/academic/components/academic-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <AcademicDashboard />
    </DashboardLayout>
  );
}
