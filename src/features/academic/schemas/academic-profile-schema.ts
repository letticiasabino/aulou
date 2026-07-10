import { z } from "zod";

const currentYear = new Date().getFullYear();

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .optional()
    .transform((value) => (value ? value : undefined));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const institutionSchema = z.object({
  name: z.string().trim().min(2, "Informe sua faculdade.").max(120),
  campus: optionalText(80),
  city: optionalText(80),
  country: z.string().trim().min(2, "Informe o país.").max(80).default("Brasil"),
});

export const courseSchema = z.object({
  name: z.string().trim().min(2, "Informe seu curso.").max(120),
  degree: optionalText(80),
});

export const semesterSchema = z
  .object({
    number: z.coerce
      .number()
      .int("Informe um semestre válido.")
      .min(1, "O semestre mínimo é 1.")
      .max(12, "O semestre máximo é 12."),
    academicYear: z.coerce
      .number()
      .int("Informe um ano válido.")
      .min(2020, "O ano letivo precisa ser 2020 ou posterior.")
      .max(currentYear + 1, "O ano letivo não pode estar tão distante."),
    startsOn: optionalDate,
    endsOn: optionalDate,
  })
  .superRefine((value, context) => {
    if (!value.startsOn || !value.endsOn) {
      return;
    }

    if (new Date(value.endsOn) < new Date(value.startsOn)) {
      context.addIssue({
        code: "custom",
        path: ["endsOn"],
        message: "A data final não pode vir antes da data inicial.",
      });
    }
  });

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

export const teacherSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do professor.").max(100),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.string().email("Informe um e-mail válido.").optional()),
  department: optionalText(80),
  notes: optionalText(240),
});

export const subjectSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da disciplina.").max(120),
  code: z
    .string()
    .trim()
    .max(24, "Use no máximo 24 caracteres.")
    .optional()
    .transform((value) => (value ? value.toUpperCase() : undefined)),
  teacherId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value !== "none" ? value : undefined)),
  teacherName: optionalText(100),
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
  scheduleNotes: optionalText(240),
});

export const academicContextSchema = z.object({
  profile: academicProfileSchema,
  subjects: z.array(subjectSchema).default([]),
});

export type InstitutionInput = z.input<typeof institutionSchema>;
export type NormalizedInstitutionInput = z.output<typeof institutionSchema>;
export type CourseInput = z.input<typeof courseSchema>;
export type NormalizedCourseInput = z.output<typeof courseSchema>;
export type SemesterInput = z.input<typeof semesterSchema>;
export type NormalizedSemesterInput = z.output<typeof semesterSchema>;
export type TeacherInput = z.input<typeof teacherSchema>;
export type NormalizedTeacherInput = z.output<typeof teacherSchema>;
export type AcademicProfileInput = z.input<typeof academicProfileSchema>;
export type NormalizedAcademicProfileInput = z.output<typeof academicProfileSchema>;
export type SubjectInput = z.input<typeof subjectSchema>;
export type NormalizedSubjectInput = z.output<typeof subjectSchema>;
export type AcademicContextInput = z.infer<typeof academicContextSchema>;
