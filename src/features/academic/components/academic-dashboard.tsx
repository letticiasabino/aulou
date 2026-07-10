"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, Sparkles, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarPlaceholder } from "@/components/ui/calendar-placeholder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAcademicContext } from "@/hooks/use-academic-context";

export function AcademicDashboard() {
  const { context, loading, summary } = useAcademicContext();
  const profile = context?.profile;

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">
          {profile ? `Olá, ${profile.displayName}` : "Dashboard"}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {profile
            ? `${profile.courseName} · ${profile.currentSemester}º semestre · ${profile.institutionName}`
            : "Conclua o onboarding para personalizar seu semestre."}
        </p>
      </div>

      {!profile ? (
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Comece pelo contexto acadêmico</CardTitle>
              <CardDescription>
                Faculdade, curso e semestre são a base para importações e planos de estudo.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/onboarding">Concluir onboarding</Link>
            </Button>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Disciplinas" value={String(summary.subjectCount)} icon={BookOpen} />
        <Metric title="Professores" value={String(summary.teacherCount)} icon={UsersRound} />
        <Metric
          title="Horas semanais"
          value={String(summary.weeklyHours || "--")}
          icon={CalendarDays}
        />
        <Metric
          title="Dificuldade média"
          value={String(summary.averageDifficulty || "--")}
          icon={Sparkles}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calendário acadêmico</CardTitle>
            <CardDescription>
              Pronto para receber os eventos importados na Sprint 4.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarPlaceholder />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas ações</CardTitle>
            <CardDescription>
              Passos úteis para preparar a importação de cronogramas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              { title: "Cadastrar disciplinas", href: "/subjects", done: summary.subjectCount > 0 },
              { title: "Cadastrar professores", href: "/teachers", done: summary.teacherCount > 0 },
              { title: "Revisar perfil acadêmico", href: "/profile", done: Boolean(profile) },
            ].map((task) => (
              <div
                key={task.title}
                className="flex items-center justify-between rounded-md border bg-background p-3"
              >
                <div className="flex flex-col gap-1">
                  <Link href={task.href} className="text-sm font-medium hover:text-primary">
                    {task.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {task.done ? "Pronto" : "Pendente"}
                  </span>
                </div>
                <Badge variant={task.done ? "default" : "secondary"}>
                  {task.done ? "OK" : "Próximo"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disciplinas recentes</CardTitle>
          <CardDescription>Base acadêmica que será usada nas importações futuras.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Disciplina</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead>Horas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(context?.subjects ?? [])
                .filter((subject) => subject.status === "active")
                .slice(0, 5)
                .map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.code ?? "--"}</TableCell>
                    <TableCell>{subject.difficulty}/5</TableCell>
                    <TableCell>{subject.weeklyHours ? `${subject.weeklyHours}h` : "--"}</TableCell>
                  </TableRow>
                ))}
              {!(context?.subjects ?? []).some((subject) => subject.status === "active") ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Nenhuma disciplina cadastrada ainda.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function DashboardLoading() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </>
  );
}

function Metric({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof BookOpen;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl">{value}</CardTitle>
        </div>
        <Icon className="text-primary" aria-hidden="true" />
      </CardHeader>
    </Card>
  );
}
