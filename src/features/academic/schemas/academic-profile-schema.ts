import { z } from "zod";

const currentYear = new Date().getFullYear();

export const academicProfileSchema = z.object({
  displayName: z.string().trim().min(2, "Informe pelo menos 2 caracteres."),
  institutionName: z.string().trim().min(2, "Informe sua faculdade."),
  courseName: z.string().trim().min(2, "Informe seu curso."),
  currentSemester: z.coerce
    .number()
    .int("Informe um semestre válido.")
    .min(1, "O semestre mínimo é 1.")
    .max(12, "O semestre máximo é 12."),
  academicYear: z.coerce
    .number()
    .int("Informe um ano válido.")
    .min(2020, "O ano letivo precisa ser 2020 ou posterior.")
    .max(currentYear + 1, "O ano letivo não pode estar tão distante."),
  timezone: z.string().trim().min(1).default("America/Sao_Paulo"),
});

export const subjectSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da disciplina."),
  code: z
    .string()
    .trim()
    .max(24, "Use no máximo 24 caracteres.")
    .optional()
    .transform((value) => (value ? value.toUpperCase() : undefined)),
  teacherName: z.string().trim().max(80, "Use no máximo 80 caracteres.").optional(),
  teacherEmail: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.string().email("Informe um e-mail válido.").optional()),
  weeklyHours: z
    .union([z.coerce.number().int().min(1).max(40), z.literal("")])
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  difficulty: z.coerce.number().int().min(1).max(5),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Informe uma cor hexadecimal válida."),
});

export const academicContextSchema = z.object({
  profile: academicProfileSchema,
  subjects: z.array(subjectSchema).default([]),
});

export type AcademicProfileInput = z.input<typeof academicProfileSchema>;
export type NormalizedAcademicProfileInput = z.output<typeof academicProfileSchema>;
export type SubjectInput = z.input<typeof subjectSchema>;
export type NormalizedSubjectInput = z.output<typeof subjectSchema>;
export type AcademicContextInput = z.infer<typeof academicContextSchema>;
