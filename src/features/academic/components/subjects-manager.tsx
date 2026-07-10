"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, BookOpen, Edit3, Loader2, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  subjectSchema,
  type SubjectInput,
} from "@/features/academic/schemas/academic-profile-schema";
import { useAcademicContext } from "@/hooks/use-academic-context";
import { academicService } from "@/services/academic.service";
import type { Subject, Teacher } from "@/types/academic-domain";

const subjectColors = ["#9b7cff", "#42d392", "#5cc8ff", "#ffcc66", "#ff7aa2"];

const blankSubject: SubjectInput = {
  name: "",
  code: "",
  teacherId: "none",
  teacherName: "",
  teacherEmail: "",
  weeklyHours: "",
  difficulty: 3,
  color: subjectColors[0],
  scheduleNotes: "",
};

export function SubjectsManager() {
  const { user, context, loading, error, refresh } = useAcademicContext();
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const form = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: blankSubject,
  });
  const selectedColor = useWatch({ control: form.control, name: "color" });
  const selectedDifficulty = useWatch({ control: form.control, name: "difficulty" });
  const selectedTeacherId = useWatch({ control: form.control, name: "teacherId" });

  function resetForm() {
    setEditingSubject(null);
    form.reset(blankSubject);
  }

  function startEditing(subject: Subject) {
    setEditingSubject(subject);
    form.reset({
      name: subject.name,
      code: subject.code ?? "",
      teacherId: subject.teacherId ?? "none",
      teacherName: "",
      teacherEmail: "",
      weeklyHours: subject.weeklyHours ? String(subject.weeklyHours) : "",
      difficulty: subject.difficulty,
      color: subject.color,
      scheduleNotes: subject.scheduleNotes ?? "",
    });
  }

  async function submit(values: SubjectInput) {
    if (!user) {
      toast.error("Entre na sua conta para cadastrar disciplinas.");
      return;
    }

    try {
      if (editingSubject) {
        await academicService.updateSubject(user.id, editingSubject.id, values);
        toast.success("Disciplina atualizada.");
      } else {
        await academicService.addSubject(user.id, values);
        toast.success("Disciplina cadastrada.");
      }
      await refresh();
      resetForm();
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível cadastrar.",
      );
    }
  }

  async function archiveSubject(subjectId: string) {
    if (!user) {
      return;
    }

    setPendingId(subjectId);

    try {
      await academicService.archiveSubject(user.id, subjectId);
      await refresh();
      if (editingSubject?.id === subjectId) {
        resetForm();
      }
      toast.success("Disciplina arquivada.");
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível arquivar.",
      );
    } finally {
      setPendingId(null);
    }
  }

  async function restoreSubject(subjectId: string) {
    if (!user) {
      return;
    }

    setPendingId(subjectId);

    try {
      await academicService.restoreSubject(user.id, subjectId);
      await refresh();
      toast.success("Disciplina reativada.");
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível reativar.",
      );
    } finally {
      setPendingId(null);
    }
  }

  async function removeSubject(subjectId: string) {
    if (!user) {
      return;
    }

    setPendingId(subjectId);

    try {
      await academicService.removeSubject(user.id, subjectId);
      await refresh();
      toast.success("Disciplina removida.");
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível remover.",
      );
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return <SubjectsLoading />;
  }

  if (error) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Não foi possível carregar disciplinas"
        description={error}
      />
    );
  }

  const subjects = context?.subjects ?? [];
  const activeSubjects = subjects.filter((subject) => subject.status === "active");
  const archivedSubjects = subjects.filter((subject) => subject.status === "archived");
  const teachers = context?.teachers.filter((teacher) => teacher.status === "active") ?? [];
  const canCreateInlineTeacher = !selectedTeacherId || selectedTeacherId === "none";

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editingSubject ? "Editar disciplina" : "Cadastrar disciplina"}</CardTitle>
          <CardDescription>
            Organize as matérias do semestre com professor, carga horária e dificuldade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(submit)}>
            <FieldGroup>
              <SubjectTextField
                id="name"
                label="Disciplina"
                placeholder="Cálculo Diferencial"
                form={form}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SubjectTextField id="code" label="Código" placeholder="MAT101" form={form} />
                <SubjectTextField
                  id="weeklyHours"
                  label="Horas/semana"
                  placeholder="4"
                  form={form}
                />
              </div>
              <Field data-invalid={Boolean(form.formState.errors.teacherId)}>
                <Label>Professor vinculado</Label>
                <Select
                  value={String(selectedTeacherId ?? "none")}
                  onValueChange={(value) =>
                    form.setValue("teacherId", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger aria-invalid={Boolean(form.formState.errors.teacherId)}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">Sem professor definido</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Se o professor ainda não existir, preencha os campos abaixo.
                </FieldDescription>
              </Field>
              {canCreateInlineTeacher ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <SubjectTextField
                    id="teacherName"
                    label="Novo professor"
                    placeholder="Prof. Ana Ribeiro"
                    form={form}
                  />
                  <SubjectTextField
                    id="teacherEmail"
                    label="E-mail do professor"
                    placeholder="ana@faculdade.edu"
                    form={form}
                  />
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(form.formState.errors.difficulty)}>
                  <Label>Dificuldade percebida</Label>
                  <Select
                    value={String(selectedDifficulty)}
                    onValueChange={(value) =>
                      form.setValue("difficulty", Number(value), { shouldValidate: true })
                    }
                  >
                    <SelectTrigger aria-invalid={Boolean(form.formState.errors.difficulty)}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {[1, 2, 3, 4, 5].map((difficulty) => (
                          <SelectItem key={difficulty} value={String(difficulty)}>
                            {difficulty} de 5
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.difficulty ? (
                    <FieldError>{form.formState.errors.difficulty.message}</FieldError>
                  ) : null}
                </Field>
                <Field>
                  <Label>Cor</Label>
                  <div className="flex h-11 items-center gap-2">
                    {subjectColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="size-7 rounded-full border border-border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ backgroundColor: color }}
                        aria-label={`Escolher cor ${color}`}
                        aria-pressed={selectedColor === color}
                        onClick={() => form.setValue("color", color, { shouldValidate: true })}
                      />
                    ))}
                  </div>
                  <FieldDescription>
                    Use cores para reconhecer matérias rapidamente.
                  </FieldDescription>
                </Field>
              </div>
              <Field data-invalid={Boolean(form.formState.errors.scheduleNotes)}>
                <Label htmlFor="scheduleNotes">Observações de rotina</Label>
                <Textarea
                  id="scheduleNotes"
                  placeholder="Ex.: aulas às terças, lista semanal, laboratório quinzenal."
                  aria-invalid={Boolean(form.formState.errors.scheduleNotes)}
                  {...form.register("scheduleNotes")}
                />
                {form.formState.errors.scheduleNotes ? (
                  <FieldError>{form.formState.errors.scheduleNotes.message}</FieldError>
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
                {editingSubject ? "Salvar alterações" : "Adicionar disciplina"}
              </Button>
              {editingSubject ? (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  <X data-icon="inline-start" />
                  Cancelar edição
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Disciplinas do semestre</CardTitle>
            <CardDescription>
              {activeSubjects.length
                ? `${activeSubjects.length} disciplina(s) ativa(s).`
                : "Cadastre suas primeiras matérias para personalizar o semestre."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeSubjects.length ? (
              <div className="flex flex-col gap-3">
                {activeSubjects.map((subject) => (
                  <SubjectRow
                    key={subject.id}
                    subject={subject}
                    teacher={teachers.find((item) => item.id === subject.teacherId)}
                    pending={pendingId === subject.id}
                    onEdit={() => startEditing(subject)}
                    onArchive={() => void archiveSubject(subject.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Nenhuma disciplina cadastrada"
                description="Adicione matérias para a IA entender seu semestre antes da importação de cronogramas."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Arquivadas</CardTitle>
            <CardDescription>
              Disciplinas fora do semestre atual ficam separadas sem bagunçar a agenda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {archivedSubjects.length ? (
              <div className="flex flex-col gap-3">
                {archivedSubjects.map((subject) => (
                  <ArchivedSubjectRow
                    key={subject.id}
                    subject={subject}
                    pending={pendingId === subject.id}
                    onRestore={() => void restoreSubject(subject.id)}
                    onRemove={() => void removeSubject(subject.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma disciplina arquivada neste contexto.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SubjectRow({
  subject,
  teacher,
  pending,
  onEdit,
  onArchive,
}: {
  subject: Subject;
  teacher?: Teacher;
  pending: boolean;
  onEdit: () => void;
  onArchive: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <SubjectSummary subject={subject} teacher={teacher} />
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="icon" onClick={onEdit}>
          <Edit3 aria-hidden="true" />
          <span className="sr-only">Editar {subject.name}</span>
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={pending} onClick={onArchive}>
          {pending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Archive aria-hidden="true" />
          )}
          <span className="sr-only">Arquivar {subject.name}</span>
        </Button>
      </div>
    </div>
  );
}

function ArchivedSubjectRow({
  subject,
  pending,
  onRestore,
  onRemove,
}: {
  subject: Subject;
  pending: boolean;
  onRestore: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <SubjectSummary subject={subject} />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          disabled={pending}
          onClick={onRestore}
        >
          <RotateCcw aria-hidden="true" />
          <span className="sr-only">Reativar {subject.name}</span>
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={pending} onClick={onRemove}>
          {pending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 aria-hidden="true" />
          )}
          <span className="sr-only">Remover {subject.name}</span>
        </Button>
      </div>
    </div>
  );
}

function SubjectSummary({ subject, teacher }: { subject: Subject; teacher?: Teacher }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span
        className="mt-1 size-3 rounded-full"
        style={{ backgroundColor: subject.color }}
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{subject.name}</p>
          {subject.code ? <Badge variant="secondary">{subject.code}</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {teacher?.name ?? "Sem professor"} · dificuldade {subject.difficulty}/5
          {subject.weeklyHours ? ` · ${subject.weeklyHours}h/semana` : ""}
        </p>
        {subject.scheduleNotes ? (
          <p className="text-sm text-muted-foreground">{subject.scheduleNotes}</p>
        ) : null}
      </div>
    </div>
  );
}

function SubjectsLoading() {
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

function SubjectTextField({
  id,
  label,
  placeholder,
  form,
}: {
  id: keyof SubjectInput;
  label: string;
  placeholder: string;
  form: UseFormReturn<SubjectInput>;
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
