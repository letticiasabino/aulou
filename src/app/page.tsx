import { LandingLayout } from "@/components/layouts/landing-layout";
import { LandingPage } from "@/features/marketing/components/landing-page";

export default function Home() {
  return (
    <LandingLayout>
      <LandingPage />
    </LandingLayout>
  );
}
