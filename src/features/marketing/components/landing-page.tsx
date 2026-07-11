import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Brain,
  CalendarCheck,
  Check,
  FileUp,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { PLAN_DEFINITIONS } from "@/config/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlaceholder } from "@/components/ui/calendar-placeholder";
import { Skeleton } from "@/components/ui/skeleton";

const steps = [
  {
    title: "Envie seu cronograma",
    description: "PDF, imagem, planilha, DOCX, CSV ou texto entram no mesmo fluxo.",
    icon: FileUp,
  },
  {
    title: "Revise o preview",
    description: "A IA separa eventos prováveis, baixa confiança e pontos que pedem revisão.",
    icon: ShieldCheck,
  },
  {
    title: "Estude com prioridade",
    description: "Sua agenda vira plano, lembretes e recomendações acionáveis.",
    icon: CalendarCheck,
  },
];

const benefits = [
  "Agenda acadêmica sem montar planilha",
  "Prazos, provas e trabalhos no mesmo lugar",
  "Plano de estudos preparado para atrasos",
  "IA tutor com contexto dos seus arquivos",
];

const features = [
  { title: "Importação inteligente", icon: FileUp },
  { title: "Agenda interna", icon: CalendarCheck },
  { title: "Plano de estudos", icon: Brain },
  { title: "Resumos e flashcards", icon: Layers },
  { title: "Quizzes", icon: Sparkles },
  { title: "Alertas úteis", icon: BellRing },
];

const faqs = [
  {
    question: "A IA salva eventos automaticamente?",
    answer: "Não. Eventos importados passam por preview e revisão antes de entrar na agenda.",
  },
  {
    question: "Funciona com imagem de cronograma?",
    answer: "A arquitetura já está preparada para imagem, PDF, DOCX, XLSX, CSV e texto.",
  },
  {
    question: "Preciso pagar para começar?",
    answer: "Não. O plano Free existe para testar o fluxo principal com limites menores.",
  },
];

export function LandingPage() {
  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col gap-8">
          <div className="flex max-w-3xl flex-col gap-5">
            <h1 className="text-5xl font-semibold leading-tight md:text-7xl">Aulou</h1>
            <p className="max-w-2xl text-xl leading-8 text-muted-foreground">
              O estudante envia o cronograma e a IA organiza automaticamente toda sua vida
              acadêmica.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/register">
                Importar cronograma
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/pricing">Ver planos</Link>
            </Button>
          </div>
          <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="text-primary" aria-hidden="true" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm font-medium">Seu semestre em ordem</p>
              <p className="text-xs text-muted-foreground">Preview antes de salvar</p>
            </div>
            <Badge>Alta confiança</Badge>
          </div>
          <div className="grid gap-4 pt-5">
            <div className="grid gap-3">
              {["Prova de Anatomia", "Trabalho de Algoritmos", "Fórum de Ética"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-md border bg-background p-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{item}</span>
                    <span className="text-xs text-muted-foreground">Fonte: cronograma.pdf</span>
                  </div>
                  <Badge variant="secondary">Revisar</Badge>
                </div>
              ))}
            </div>
            <CalendarPlaceholder />
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-20">
          <SectionHeader
            title="Como funciona"
            description="Três passos simples para transformar arquivo bagunçado em uma rotina clara."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.title}>
                <CardHeader>
                  <step.icon className="text-primary" aria-hidden="true" />
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="beneficios"
        className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.8fr_1fr]"
      >
        <SectionHeader
          title="Clareza para semanas caóticas"
          description="Aulou foi desenhado para estudantes que trabalham, têm muitas disciplinas e recebem arquivos em formatos diferentes."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="rounded-lg border bg-card p-5">
              <Check className="mb-4 text-primary" aria-hidden="true" />
              <p className="font-medium">{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="funcionalidades" className="border-y bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-20">
          <SectionHeader
            title="Funcionalidades preparadas para evoluir"
            description="A Sprint 1 entrega a fundação visual e técnica para ativar regras acadêmicas nas próximas etapas."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="text-primary" aria-hidden="true" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>
                    Estrutura pronta para conectar dados reais, IA e limites de plano.
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-20 lg:grid-cols-3">
        {["Marina, Medicina", "Lucas, Engenharia", "Bianca, Direito"].map((name) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <CardDescription>
                Eu não precisei montar outra planilha. Consegui ver provas, entregas e estudo na
                mesma tela.
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section id="planos" className="border-y bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-20">
          <SectionHeader
            title="Planos para começar agora"
            description="Comece grátis e faça upgrade quando importar mais arquivos, gerar mais estudos ou precisar de IA avançada."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {Object.values(PLAN_DEFINITIONS).map((plan) => (
              <Card key={plan.code}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.priceMonthlyCents === 0
                      ? "R$ 0"
                      : `R$ ${(plan.priceMonthlyCents / 100).toFixed(2).replace(".", ",")}/mês`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="text-primary" aria-hidden="true" />
                      {feature}
                    </div>
                  ))}
                  <Button variant={plan.code === "plus" ? "default" : "secondary"} asChild>
                    <Link href="/register">Escolher {plan.name}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.8fr_1fr]">
        <SectionHeader
          title="Perguntas frequentes"
          description="As decisões mais importantes do produto já começam transparentes."
        />
        <div className="grid gap-4">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle>{faq.question}</CardTitle>
                <CardDescription>{faq.answer}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-20">
        <div className="rounded-lg border bg-card p-8 md:p-12">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-semibold">Deixe a IA organizar seu semestre.</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                A primeira importação é o momento em que o caos vira uma agenda revisável.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/register">
                Começar agora
                <Zap data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex max-w-3xl flex-col gap-3">
      <h2 className="text-3xl font-semibold md:text-5xl">{title}</h2>
      <p className="text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

export function LandingSkeletonPreview() {
  return (
    <div className="grid gap-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-3/4" />
    </div>
  );
}
