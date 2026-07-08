import { ArrowRight, CalendarCheck, FileUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const foundationItems = [
  {
    title: "Importação com preview",
    description: "Eventos extraídos por IA passam por validação, confiança e revisão antes de entrar na agenda.",
    icon: FileUp,
  },
  {
    title: "Agenda inteligente",
    description: "Provas, trabalhos, aulas e fóruns terão prioridade, conflitos e alertas acadêmicos.",
    icon: CalendarCheck,
  },
  {
    title: "Tutor contextual",
    description: "Resumos, flashcards e recomendações vão separar fatos extraídos de inferências.",
    icon: Sparkles,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-12">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex size-2 rounded-full bg-accent" />
            Sprint 0 em andamento
          </div>
          <div className="flex max-w-3xl flex-col gap-5">
            <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-6xl">
              StudyPilot AI
            </h1>
            <p className="text-lg leading-8 text-muted-foreground md:text-xl">
              Importe seu cronograma e deixe a IA organizar seu semestre.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button>
              Importar cronograma
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button variant="secondary">Ver arquitetura</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {foundationItems.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="text-primary" aria-hidden="true" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fundação do produto</CardTitle>
            <CardDescription>
              Documentação, decisões, segurança, monetização e engines foram priorizadas antes das features.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>Docs</Badge>
            <Badge variant="secondary">Supabase preparado</Badge>
            <Badge variant="secondary">OpenAI abstraída</Badge>
            <Badge variant="secondary">Planos Free/Plus/Pro</Badge>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
