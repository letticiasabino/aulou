"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Loader2, Plus, Trash2, UsersRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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
import {
  subjectSchema,
  type SubjectInput,
} from "@/features/academic/schemas/academic-profile-schema";
import { useAcademicContext } from "@/hooks/use-academic-context";
import { academicService } from "@/services/academic.service";
import type { Subject, Teacher } from "@/types/academic-domain";

const subjectColors = ["#9b7cff", "#42d392", "#5cc8ff", "#ffcc66", "#ff7aa2"];

export function SubjectsManager() {
  const { user, context, loading, refresh } = useAcademicContext();
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);
  const form = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
      teacherName: "",
      teacherEmail: "",
      weeklyHours: "",
      difficulty: 3,
      color: subjectColors[0],
    },
  });
  const selectedColor = useWatch({ control: form.control, name: "color" });
  const selectedDifficulty = useWatch({ control: form.control, name: "difficulty" });

  async function submit(values: SubjectInput) {
    if (!user) {
      toast.error("Entre na sua conta para cadastrar disciplinas.");
      return;
    }

    try {
      await academicService.addSubject(user.id, values);
      await refresh();
      form.reset({
        name: "",
        code: "",
        teacherName: "",
        teacherEmail: "",
        weeklyHours: "",
        difficulty: 3,
        color: subjectColors[0],
      });
      toast.success("Disciplina cadastrada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível cadastrar.");
    }
  }

  async function removeSubject(subjectId: string) {
    if (!user) {
      return;
    }

    setPendingDeleteId(subjectId);

    try {
      await academicService.removeSubject(user.id, subjectId);
      await refresh();
      toast.success("Disciplina removida.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover.");
    } finally {
      setPendingDeleteId(null);
    }
  }

  const subjects = context?.subjects ?? [];
  const teachers = context?.teachers ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar disciplina</CardTitle>
          <CardDescription>
            Adicione as matérias do semestre. Professores são criados automaticamente quando
            informados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(submit)}>
            <FieldGroup>
              <TextField
                id="name"
                label="Disciplina"
                placeholder="Cálculo Diferencial"
                form={form}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField id="code" label="Código" placeholder="MAT101" form={form} />
                <TextField id="weeklyHours" label="Horas/semana" placeholder="4" form={form} />
              </div>
              <TextField
                id="teacherName"
                label="Professor"
                placeholder="Prof. Ana Ribeiro"
                form={form}
              />
              <TextField
                id="teacherEmail"
                label="E-mail do professor"
                placeholder="ana@faculdade.edu"
                form={form}
              />
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
            </FieldGroup>
            <Button disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Plus data-icon="inline-start" />
              )}
              Adicionar disciplina
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Disciplinas do semestre</CardTitle>
            <CardDescription>
              {subjects.length
                ? `${subjects.length} disciplina(s) cadastrada(s).`
                : "Cadastre suas primeiras matérias para personalizar o semestre."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando disciplinas...</p>
            ) : subjects.length ? (
              <div className="flex flex-col gap-3">
                {subjects.map((subject) => (
                  <SubjectRow
                    key={subject.id}
                    subject={subject}
                    teacher={teachers.find((item) => item.id === subject.teacherId)}
                    pending={pendingDeleteId === subject.id}
                    onDelete={() => void removeSubject(subject.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Nenhuma disciplina cadastrada"
                description="Adicione matérias para a IA entender seu semestre antes da importação de cronogramas."
                actionLabel="Pronto para começar"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professores</CardTitle>
            <CardDescription>Lista criada a partir das disciplinas cadastradas.</CardDescription>
          </CardHeader>
          <CardContent>
            {teachers.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="rounded-md border bg-background p-3">
                    <div className="flex items-center gap-2">
                      <UsersRound className="text-primary" aria-hidden="true" />
                      <p className="font-medium">{teacher.name}</p>
                    </div>
                    {teacher.email ? (
                      <p className="mt-1 text-sm text-muted-foreground">{teacher.email}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Professores aparecerão aqui quando você os vincular às disciplinas.
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
  onDelete,
}: {
  subject: Subject;
  teacher?: Teacher;
  pending: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 size-3 rounded-full"
          style={{ backgroundColor: subject.color }}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{subject.name}</p>
            {subject.code ? <Badge variant="secondary">{subject.code}</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {teacher?.name ?? "Sem professor"} · dificuldade {subject.difficulty}/5
            {subject.weeklyHours ? ` · ${subject.weeklyHours}h/semana` : ""}
          </p>
        </div>
      </div>
      <Button type="button" variant="ghost" size="icon" disabled={pending} onClick={onDelete}>
        {pending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 aria-hidden="true" />
        )}
        <span className="sr-only">Remover {subject.name}</span>
      </Button>
    </div>
  );
}

function TextField({
  id,
  label,
  placeholder,
  form,
}: {
  id: keyof SubjectInput;
  label: string;
  placeholder: string;
  form: ReturnType<typeof useForm<SubjectInput>>;
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
