import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { OnboardingFlow } from "@/features/onboarding/components/onboarding-flow";

export default function OnboardingPage() {
  return (
    <DashboardLayout title="Onboarding">
      <OnboardingFlow />
    </DashboardLayout>
  );
}
