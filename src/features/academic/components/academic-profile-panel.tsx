"use client";

import Link from "next/link";
import { BookOpen, Building2, CalendarDays, GraduationCap, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAcademicContext } from "@/hooks/use-academic-context";

export function AcademicProfilePanel() {
  const { context, loading, summary } = useAcademicContext();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!context?.profile) {
    return (
      <EmptyState
        icon={UserRound}
        title="Perfil acadêmico incompleto"
        description="Conclua o onboarding para a IA entender faculdade, curso e semestre."
        actionLabel="Abrir onboarding"
        actionHref="/onboarding"
      />
    );
  }

  const profile = context.profile;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{profile.displayName}</CardTitle>
            <CardDescription>
              Perfil acadêmico usado para personalizar importações, agenda e estudos.
            </CardDescription>
          </div>
          <Button asChild variant="secondary">
            <Link href="/onboarding">Editar onboarding</Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProfileMetric icon={Building2} label="Faculdade" value={profile.institutionName} />
        <ProfileMetric icon={GraduationCap} label="Curso" value={profile.courseName} />
        <ProfileMetric
          icon={CalendarDays}
          label="Semestre"
          value={`${profile.currentSemester}º semestre`}
        />
        <ProfileMetric icon={BookOpen} label="Disciplinas" value={String(summary.subjectCount)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do semestre</CardTitle>
          <CardDescription>Primeiros indicadores usados pelo Aulou.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border bg-background p-4">
            <p className="text-sm text-muted-foreground">Professores</p>
            <p className="mt-2 text-2xl font-semibold">{summary.teacherCount}</p>
          </div>
          <div className="rounded-md border bg-background p-4">
            <p className="text-sm text-muted-foreground">Dificuldade média</p>
            <p className="mt-2 text-2xl font-semibold">{summary.averageDifficulty || "--"}</p>
          </div>
          <div className="rounded-md border bg-background p-4">
            <p className="text-sm text-muted-foreground">Horas semanais</p>
            <p className="mt-2 text-2xl font-semibold">{summary.weeklyHours || "--"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="truncate text-xl">{value}</CardTitle>
        </div>
        <Icon className="text-primary" aria-hidden="true" />
      </CardHeader>
    </Card>
  );
}
