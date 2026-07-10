"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Building2, CalendarDays, GraduationCap, Loader2 } from "lucide-react";
import { useForm, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  courseSchema,
  institutionSchema,
  semesterSchema,
  type CourseInput,
  type InstitutionInput,
  type SemesterInput,
} from "@/features/academic/schemas/academic-profile-schema";
import { useAcademicContext } from "@/hooks/use-academic-context";
import { academicService } from "@/services/academic.service";
import type { AcademicContext } from "@/types/academic-domain";

const currentYear = new Date().getFullYear();

export function AcademicDomainManager() {
  const { user, context, loading, error, refresh, summary } = useAcademicContext();

  if (loading) {
    return <AcademicDomainLoading />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Não foi possível carregar seus dados"
        description={error}
      />
    );
  }

  if (!user || !context) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Sessão necessária"
        description="Entre na sua conta para editar seu contexto acadêmico."
        actionLabel="Entrar"
        actionHref="/login"
      />
    );
  }

  if (!context.profile) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Contexto acadêmico incompleto"
        description="Conclua o onboarding para liberar a edição de faculdade, curso e semestre."
        actionLabel="Abrir onboarding"
        actionHref="/onboarding"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Contexto acadêmico</CardTitle>
            <CardDescription>
              Base usada pela IA para interpretar cronogramas, materiais e prioridades.
            </CardDescription>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryPill label="Disciplinas" value={String(summary.subjectCount)} />
            <SummaryPill label="Professores" value={String(summary.teacherCount)} />
            <SummaryPill label="Horas/semana" value={String(summary.weeklyHours || "--")} />
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="institution" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="institution">Faculdade</TabsTrigger>
          <TabsTrigger value="course">Curso</TabsTrigger>
          <TabsTrigger value="semester">Semestre</TabsTrigger>
        </TabsList>
        <TabsContent value="institution">
          <InstitutionForm userId={user.id} context={context} refresh={refresh} />
        </TabsContent>
        <TabsContent value="course">
          <CourseForm userId={user.id} context={context} refresh={refresh} />
        </TabsContent>
        <TabsContent value="semester">
          <SemesterForm userId={user.id} context={context} refresh={refresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AcademicDomainLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InstitutionForm({
  userId,
  context,
  refresh,
}: {
  userId: string;
  context: AcademicContext;
  refresh: () => Promise<AcademicContext | null>;
}) {
  const form = useForm<InstitutionInput>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: context.institution?.name ?? context.profile?.institutionName ?? "",
      campus: context.institution?.campus ?? "",
      city: context.institution?.city ?? "",
      country: context.institution?.country ?? "Brasil",
    },
  });

  React.useEffect(() => {
    form.reset({
      name: context.institution?.name ?? context.profile?.institutionName ?? "",
      campus: context.institution?.campus ?? "",
      city: context.institution?.city ?? "",
      country: context.institution?.country ?? "Brasil",
    });
  }, [context.institution, context.profile?.institutionName, form]);

  async function submit(values: InstitutionInput) {
    try {
      await academicService.saveInstitution(userId, values);
      await refresh();
      toast.success("Faculdade atualizada.");
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível salvar.",
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <Building2 className="text-primary" aria-hidden="true" />
        <CardTitle>Faculdade</CardTitle>
        <CardDescription>
          Cadastre a instituição principal, campus e localização do semestre atual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 lg:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
          <FieldGroup>
            <TextField id="name" label="Faculdade" placeholder="Universidade Federal" form={form} />
            <TextField id="campus" label="Campus" placeholder="Campus Centro" form={form} />
          </FieldGroup>
          <FieldGroup>
            <TextField id="city" label="Cidade" placeholder="São Paulo" form={form} />
            <TextField id="country" label="País" placeholder="Brasil" form={form} />
            <SubmitButton loading={form.formState.isSubmitting} label="Salvar faculdade" />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function CourseForm({
  userId,
  context,
  refresh,
}: {
  userId: string;
  context: AcademicContext;
  refresh: () => Promise<AcademicContext | null>;
}) {
  const form = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: context.course?.name ?? context.profile?.courseName ?? "",
      degree: context.course?.degree ?? "",
    },
  });

  React.useEffect(() => {
    form.reset({
      name: context.course?.name ?? context.profile?.courseName ?? "",
      degree: context.course?.degree ?? "",
    });
  }, [context.course, context.profile?.courseName, form]);

  async function submit(values: CourseInput) {
    try {
      await academicService.saveCourse(userId, values);
      await refresh();
      toast.success("Curso atualizado.");
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível salvar.",
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <GraduationCap className="text-primary" aria-hidden="true" />
        <CardTitle>Curso</CardTitle>
        <CardDescription>
          Mantenha o curso ativo alinhado com a faculdade e o planejamento do semestre.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 lg:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
          <TextField id="name" label="Curso" placeholder="Engenharia de Software" form={form} />
          <FieldGroup>
            <TextField
              id="degree"
              label="Grau ou modalidade"
              placeholder="Bacharelado"
              form={form}
            />
            <SubmitButton loading={form.formState.isSubmitting} label="Salvar curso" />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function SemesterForm({
  userId,
  context,
  refresh,
}: {
  userId: string;
  context: AcademicContext;
  refresh: () => Promise<AcademicContext | null>;
}) {
  const form = useForm<SemesterInput>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      number: context.semester?.number ?? context.profile?.currentSemester ?? 1,
      academicYear: context.semester?.academicYear ?? context.profile?.academicYear ?? currentYear,
      startsOn: context.semester?.startsOn ?? "",
      endsOn: context.semester?.endsOn ?? "",
    },
  });

  React.useEffect(() => {
    form.reset({
      number: context.semester?.number ?? context.profile?.currentSemester ?? 1,
      academicYear: context.semester?.academicYear ?? context.profile?.academicYear ?? currentYear,
      startsOn: context.semester?.startsOn ?? "",
      endsOn: context.semester?.endsOn ?? "",
    });
  }, [context.semester, context.profile?.academicYear, context.profile?.currentSemester, form]);

  async function submit(values: SemesterInput) {
    try {
      await academicService.saveSemester(userId, values);
      await refresh();
      toast.success("Semestre atualizado.");
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível salvar.",
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CalendarDays className="text-primary" aria-hidden="true" />
        <CardTitle>Semestre</CardTitle>
        <CardDescription>
          Datas são opcionais agora, mas ajudam a calcular prazos e planos nas próximas sprints.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 lg:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
          <FieldGroup>
            <TextField id="number" label="Semestre atual" placeholder="4" form={form} />
            <TextField id="academicYear" label="Ano letivo" placeholder="2026" form={form} />
          </FieldGroup>
          <FieldGroup>
            <DateField id="startsOn" label="Início do semestre" form={form} />
            <DateField id="endsOn" label="Fim do semestre" form={form} />
            <FieldDescription>
              Se ainda não souber as datas, deixe em branco. O app não vai inventar.
            </FieldDescription>
            <SubmitButton loading={form.formState.isSubmitting} label="Salvar semestre" />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function TextField<T extends FieldValues>({
  id,
  label,
  placeholder,
  form,
}: {
  id: Path<T>;
  label: string;
  placeholder: string;
  form: UseFormReturn<T>;
}) {
  const error = form.getFieldState(id).error;

  return (
    <Field data-invalid={Boolean(error)}>
      <Label htmlFor={String(id)}>{label}</Label>
      <Input
        id={String(id)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...form.register(id)}
      />
      {error ? <FieldError>{error.message}</FieldError> : null}
    </Field>
  );
}

function DateField({
  id,
  label,
  form,
}: {
  id: Path<SemesterInput>;
  label: string;
  form: UseFormReturn<SemesterInput>;
}) {
  const error = form.getFieldState(id).error;

  return (
    <Field data-invalid={Boolean(error)}>
      <Label htmlFor={String(id)}>{label}</Label>
      <Input id={String(id)} type="date" aria-invalid={Boolean(error)} {...form.register(id)} />
      {error ? <FieldError>{error.message}</FieldError> : null}
    </Field>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <Button className="w-fit" disabled={loading}>
      {loading ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
      {label}
    </Button>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
