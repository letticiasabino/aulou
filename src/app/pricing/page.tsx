import type { Metadata } from "next";
import { LandingLayout } from "@/components/layouts/landing-layout";
import { LandingPage } from "@/features/marketing/components/landing-page";
import { PricingTable } from "@/features/monetization/components/pricing-table";

export const metadata: Metadata = {
  title: "Planos",
  description: "Planos Free, Plus e Pro do Aulou.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <LandingLayout>
      <LandingPage />
      <section
        className="mx-auto w-full max-w-7xl px-4 pb-20 lg:px-8"
        aria-labelledby="pricing-table-title"
      >
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium text-primary">Planos Aulou</p>
          <h1 id="pricing-table-title" className="mt-2 text-3xl font-semibold tracking-tight">
            Escolha o ritmo que combina com seu semestre.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Comece grátis e faça upgrade quando precisar de mais arquivos, IA e profundidade.
          </p>
        </div>
        <PricingTable />
      </section>
    </LandingLayout>
  );
}
