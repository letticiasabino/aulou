import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SubscriptionWorkspace } from "@/features/monetization/components/subscription-workspace";

export const metadata: Metadata = { title: "Assinatura" };
export default function SubscriptionPage() {
  return (
    <DashboardLayout title="Assinatura">
      <SubscriptionWorkspace />
    </DashboardLayout>
  );
}
