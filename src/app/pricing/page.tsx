import type { Metadata } from "next";
import { LandingLayout } from "@/components/layouts/landing-layout";
import { LandingPage } from "@/features/marketing/components/landing-page";

export const metadata: Metadata = {
  title: "Planos",
  description: "Planos Free, Plus e Pro do StudyPilot AI.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <LandingLayout>
      <LandingPage />
    </LandingLayout>
  );
}
