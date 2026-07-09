import { LandingLayout } from "@/components/layouts/landing-layout";

export default function PrivacyPage() {
  return (
    <LandingLayout>
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col gap-4 px-6 py-20">
        <h1 className="text-4xl font-semibold">Privacidade</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Arquivos acadêmicos são tratados como dados sensíveis. A política completa será detalhada
          antes da primeira versão beta.
        </p>
      </main>
    </LandingLayout>
  );
}
