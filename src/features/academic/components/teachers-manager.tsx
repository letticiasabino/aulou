"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Edit3, Loader2, Plus, Trash2, UsersRound, X } from "lucide-react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  teacherSchema,
  type TeacherInput,
} from "@/features/academic/schemas/academic-profile-schema";
import { useAcademicContext } from "@/hooks/use-academic-context";
import { academicService } from "@/services/academic.service";
import type { Teacher } from "@/types/academic-domain";

export function TeachersManager() {
  const { user, context, loading, error, refresh } = useAcademicContext();
  const [editingTeacher, setEditingTeacher] = React.useState<Teacher | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const form = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      notes: "",
    },
  });

  function resetForm() {
    setEditingTeacher(null);
    form.reset({ name: "", email: "", department: "", notes: "" });
  }

  function startEditing(teacher: Teacher) {
    setEditingTeacher(teacher);
    form.reset({
      name: teacher.name,
      email: teacher.email ?? "",
      department: teacher.department ?? "",
      notes: teacher.notes ?? "",
    });
  }

  async function submit(values: TeacherInput) {
    if (!user) {
      toast.error("Entre na sua conta para gerenciar professores.");
      return;
    }

    try {
      if (editingTeacher) {
        await academicService.updateTeacher(user.id, editingTeacher.id, values);
        toast.success("Professor atualizado.");
      } else {
        await academicService.addTeacher(user.id, values);
        toast.success("Professor cadastrado.");
      }
      await refresh();
      resetForm();
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível salvar.",
      );
    }
  }

  async function removeTeacher(teacherId: string) {
    if (!user) {
      return;
    }

    setPendingId(teacherId);

    try {
      await academicService.removeTeacher(user.id, teacherId);
      await refresh();
      if (editingTeacher?.id === teacherId) {
        resetForm();
      }
      toast.success("Professor removido.");
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível remover.",
      );
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return <TeachersLoading />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Não foi possível carregar professores"
        description={error}
      />
    );
  }

  const teachers = context?.teachers.filter((teacher) => teacher.status === "active") ?? [];
  const subjects = context?.subjects ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editingTeacher ? "Editar professor" : "Cadastrar professor"}</CardTitle>
          <CardDescription>
            Professores podem ser criados antes das disciplinas e vinculados depois.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(submit)}>
            <FieldGroup>
              <TeacherTextField
                id="name"
                label="Professor"
                placeholder="Prof. Ana Ribeiro"
                form={form}
              />
              <TeacherTextField
                id="email"
                label="E-mail"
                placeholder="ana@faculdade.edu"
                form={form}
              />
              <TeacherTextField
                id="department"
                label="Departamento"
                placeholder="Departamento de Exatas"
                form={form}
              />
              <Field data-invalid={Boolean(form.formState.errors.notes)}>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Horários de atendimento, preferências ou links úteis."
                  aria-invalid={Boolean(form.formState.errors.notes)}
                  {...form.register("notes")}
                />
                {form.formState.errors.notes ? (
                  <FieldError>{form.formState.errors.notes.message}</FieldError>
                ) : null}
              </Field>
            </FieldGroup>
            <div className="flex flex-wrap gap-2">
              <Button disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Plus data-icon="inline-start" />
                )}
                {editingTeacher ? "Salvar alterações" : "Adicionar professor"}
              </Button>
              {editingTeacher ? (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  <X data-icon="inline-start" />
                  Cancelar edição
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professores cadastrados</CardTitle>
          <CardDescription>
            {teachers.length
              ? `${teachers.length} professor(es) no contexto acadêmico.`
              : "Cadastre professores para vincular disciplinas e materiais."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teachers.length ? (
            <div className="grid gap-3">
              {teachers.map((teacher) => (
                <TeacherRow
                  key={teacher.id}
                  teacher={teacher}
                  linkedSubjects={
                    subjects.filter((subject) => subject.teacherId === teacher.id).length
                  }
                  pending={pendingId === teacher.id}
                  onEdit={() => startEditing(teacher)}
                  onRemove={() => void removeTeacher(teacher.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={UsersRound}
              title="Nenhum professor cadastrado"
              description="Você pode adicionar professores agora ou criá-los junto com as disciplinas."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TeacherRow({
  teacher,
  linkedSubjects,
  pending,
  onEdit,
  onRemove,
}: {
  teacher: Teacher;
  linkedSubjects: number;
  pending: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{teacher.name}</p>
          <Badge variant="secondary">{linkedSubjects} vínculo(s)</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {[teacher.email, teacher.department].filter(Boolean).join(" · ") || "Sem detalhes extras"}
        </p>
        {teacher.notes ? (
          <p className="mt-2 text-sm text-muted-foreground">{teacher.notes}</p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="icon" onClick={onEdit}>
          <Edit3 aria-hidden="true" />
          <span className="sr-only">Editar {teacher.name}</span>
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={pending} onClick={onRemove}>
          {pending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 aria-hidden="true" />
          )}
          <span className="sr-only">Remover {teacher.name}</span>
        </Button>
      </div>
    </div>
  );
}

function TeachersLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {Array.from({ length: 2 }, (_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-44" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TeacherTextField({
  id,
  label,
  placeholder,
  form,
}: {
  id: keyof TeacherInput;
  label: string;
  placeholder: string;
  form: UseFormReturn<TeacherInput>;
}) {
  const error = form.formState.errors[id];

  return (
    <Field data-invalid={Boolean(error)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...form.register(id)}
      />
      {error ? <FieldError>{error.message}</FieldError> : null}
    </Field>
  );
}
