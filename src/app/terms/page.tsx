import { LandingLayout } from "@/components/layouts/landing-layout";

export default function TermsPage() {
  return (
    <LandingLayout>
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col gap-4 px-6 py-20">
        <h1 className="text-4xl font-semibold">Termos de uso</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Esta versão inicial define a base do produto. Termos completos serão revisados antes do
          beta público.
        </p>
      </main>
    </LandingLayout>
  );
}
