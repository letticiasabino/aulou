import {
  academicProfileSchema,
  courseSchema,
  institutionSchema,
  semesterSchema,
  subjectSchema,
  teacherSchema,
  type AcademicProfileInput,
  type CourseInput,
  type InstitutionInput,
  type SemesterInput,
  type SubjectInput,
  type TeacherInput,
} from "@/features/academic/schemas/academic-profile-schema";
import { createClient } from "@/lib/supabase/client";
import type {
  AcademicContext,
  AcademicProfile,
  Course,
  Institution,
  Semester,
  Subject,
  Teacher,
} from "@/types/academic-domain";
import type {
  CourseRow,
  InstitutionRow,
  ProfileRow,
  SemesterRow,
  SubjectRow,
  TeacherRow,
} from "@/types/database.types";

const defaultTimezone = "America/Sao_Paulo";
const defaultCountry = "Brasil";

function now() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  const value =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${prefix}_${value}`;
}

function emptyContext(): AcademicContext {
  return {
    profile: null,
    institution: null,
    course: null,
    semester: null,
    teachers: [],
    subjects: [],
  };
}

function assertSupabaseResult(error: { message: string } | null, fallback: string) {
  if (error) {
    throw new Error(error.message || fallback);
  }
}

function toNull(value?: string | null) {
  return value || null;
}

function mapInstitution(row: InstitutionRow | null): Institution | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    campus: row.campus ?? undefined,
    city: row.city ?? undefined,
    country: row.country,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCourse(row: CourseRow | null): Course | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    institutionId: row.institution_id,
    name: row.name,
    institutionName: row.institution_name,
    degree: row.degree ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSemester(row: SemesterRow | null): Semester | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    label: row.label,
    number: row.number,
    academicYear: row.academic_year,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProfile(row: ProfileRow | null): AcademicProfile | null {
  if (!row) {
    return null;
  }

  return {
    userId: row.user_id,
    institutionId: row.institution_id,
    courseId: row.course_id,
    semesterId: row.semester_id,
    displayName: row.display_name,
    institutionName: row.institution_name,
    courseName: row.course_name,
    currentSemester: row.current_semester,
    academicYear: row.academic_year,
    timezone: row.timezone,
    onboardingCompletedAt: row.onboarding_completed_at,
    updatedAt: row.updated_at,
  };
}

function mapTeacher(row: TeacherRow): Teacher {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email ?? undefined,
    department: row.department ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    userId: row.user_id,
    semesterId: row.semester_id,
    teacherId: row.teacher_id,
    name: row.name,
    code: row.code ?? undefined,
    weeklyHours: row.weekly_hours ?? undefined,
    difficulty: row.difficulty as Subject["difficulty"],
    color: row.color,
    scheduleNotes: row.schedule_notes ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const supabaseAcademicRepository = {
  async getContext(userId: string): Promise<AcademicContext> {
    const supabase = createClient();

    const [
      profileResult,
      institutionResult,
      courseResult,
      semesterResult,
      teachersResult,
      subjectsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("institutions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("courses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("semesters")
        .select("*")
        .eq("user_id", userId)
        .order("created_at")
        .limit(1)
        .maybeSingle(),
      supabase.from("teachers").select("*").eq("user_id", userId).order("created_at"),
      supabase.from("subjects").select("*").eq("user_id", userId).order("created_at"),
    ]);

    assertSupabaseResult(profileResult.error, "Não foi possível carregar o perfil.");
    assertSupabaseResult(institutionResult.error, "Não foi possível carregar a faculdade.");
    assertSupabaseResult(courseResult.error, "Não foi possível carregar o curso.");
    assertSupabaseResult(semesterResult.error, "Não foi possível carregar o semestre.");
    assertSupabaseResult(teachersResult.error, "Não foi possível carregar os professores.");
    assertSupabaseResult(subjectsResult.error, "Não foi possível carregar as disciplinas.");

    return {
      profile: mapProfile(profileResult.data),
      institution: mapInstitution(institutionResult.data),
      course: mapCourse(courseResult.data),
      semester: mapSemester(semesterResult.data),
      teachers: (teachersResult.data ?? []).map(mapTeacher),
      subjects: (subjectsResult.data ?? []).map(mapSubject),
    };
  },

  async saveProfile(userId: string, input: AcademicProfileInput): Promise<AcademicContext> {
    const values = academicProfileSchema.parse(input);
    const supabase = createClient();
    const current = await this.getContext(userId);
    const timestamp = now();
    const institutionId = current.institution?.id ?? createId("institution");
    const courseId = current.course?.id ?? createId("course");
    const semesterId = current.semester?.id ?? createId("semester");

    const institutionResult = await supabase.from("institutions").upsert(
      {
        id: institutionId,
        user_id: userId,
        name: values.institutionName,
        campus: current.institution?.campus ?? null,
        city: current.institution?.city ?? null,
        country: current.institution?.country ?? defaultCountry,
      },
      { onConflict: "id" },
    );
    assertSupabaseResult(institutionResult.error, "Não foi possível salvar a faculdade.");

    const courseResult = await supabase.from("courses").upsert(
      {
        id: courseId,
        user_id: userId,
        institution_id: institutionId,
        name: values.courseName,
        institution_name: values.institutionName,
        degree: current.course?.degree ?? null,
        status: current.course?.status ?? "active",
      },
      { onConflict: "id" },
    );
    assertSupabaseResult(courseResult.error, "Não foi possível salvar o curso.");

    const semesterResult = await supabase.from("semesters").upsert(
      {
        id: semesterId,
        user_id: userId,
        course_id: courseId,
        label: `${values.currentSemester}º semestre - ${values.academicYear}`,
        number: values.currentSemester,
        academic_year: values.academicYear,
        starts_on: current.semester?.startsOn ?? null,
        ends_on: current.semester?.endsOn ?? null,
        status: current.semester?.status ?? "active",
      },
      { onConflict: "id" },
    );
    assertSupabaseResult(semesterResult.error, "Não foi possível salvar o semestre.");

    const profileResult = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        institution_id: institutionId,
        course_id: courseId,
        semester_id: semesterId,
        display_name: values.displayName,
        institution_name: values.institutionName,
        course_name: values.courseName,
        current_semester: values.currentSemester,
        academic_year: values.academicYear,
        timezone: values.timezone || defaultTimezone,
        onboarding_completed_at: current.profile?.onboardingCompletedAt ?? timestamp,
      },
      { onConflict: "user_id" },
    );
    assertSupabaseResult(profileResult.error, "Não foi possível salvar o perfil.");

    return this.getContext(userId);
  },

  async saveInstitution(userId: string, input: InstitutionInput): Promise<AcademicContext> {
    const values = institutionSchema.parse(input);
    const supabase = createClient();
    const current = await this.getContext(userId);
    const institutionId = current.institution?.id ?? createId("institution");

    const institutionResult = await supabase.from("institutions").upsert(
      {
        id: institutionId,
        user_id: userId,
        name: values.name,
        campus: toNull(values.campus),
        city: toNull(values.city),
        country: values.country || defaultCountry,
      },
      { onConflict: "id" },
    );
    assertSupabaseResult(institutionResult.error, "Não foi possível salvar a faculdade.");

    if (current.course) {
      const courseResult = await supabase
        .from("courses")
        .update({ institution_id: institutionId, institution_name: values.name })
        .eq("id", current.course.id)
        .eq("user_id", userId);
      assertSupabaseResult(courseResult.error, "Não foi possível sincronizar o curso.");
    }

    if (current.profile) {
      const profileResult = await supabase
        .from("profiles")
        .update({ institution_id: institutionId, institution_name: values.name })
        .eq("user_id", userId);
      assertSupabaseResult(profileResult.error, "Não foi possível sincronizar o perfil.");
    }

    return this.getContext(userId);
  },

  async saveCourse(userId: string, input: CourseInput): Promise<AcademicContext> {
    const values = courseSchema.parse(input);
    const supabase = createClient();
    const current = await this.getContext(userId);
    const courseId = current.course?.id ?? createId("course");

    const courseResult = await supabase.from("courses").upsert(
      {
        id: courseId,
        user_id: userId,
        institution_id: current.institution?.id ?? null,
        name: values.name,
        institution_name: current.institution?.name ?? current.profile?.institutionName ?? "",
        degree: toNull(values.degree),
        status: current.course?.status ?? "active",
      },
      { onConflict: "id" },
    );
    assertSupabaseResult(courseResult.error, "Não foi possível salvar o curso.");

    if (current.semester) {
      const semesterResult = await supabase
        .from("semesters")
        .update({ course_id: courseId })
        .eq("id", current.semester.id)
        .eq("user_id", userId);
      assertSupabaseResult(semesterResult.error, "Não foi possível sincronizar o semestre.");
    }

    if (current.profile) {
      const profileResult = await supabase
        .from("profiles")
        .update({ course_id: courseId, course_name: values.name })
        .eq("user_id", userId);
      assertSupabaseResult(profileResult.error, "Não foi possível sincronizar o perfil.");
    }

    return this.getContext(userId);
  },

  async saveSemester(userId: string, input: SemesterInput): Promise<AcademicContext> {
    const values = semesterSchema.parse(input);
    const supabase = createClient();
    const current = await this.getContext(userId);
    const semesterId = current.semester?.id ?? createId("semester");

    const semesterResult = await supabase.from("semesters").upsert(
      {
        id: semesterId,
        user_id: userId,
        course_id: current.course?.id ?? null,
        label: `${values.number}º semestre - ${values.academicYear}`,
        number: values.number,
        academic_year: values.academicYear,
        starts_on: values.startsOn ?? null,
        ends_on: values.endsOn ?? null,
        status: current.semester?.status ?? "active",
      },
      { onConflict: "id" },
    );
    assertSupabaseResult(semesterResult.error, "Não foi possível salvar o semestre.");

    if (current.profile) {
      const profileResult = await supabase
        .from("profiles")
        .update({
          semester_id: semesterId,
          current_semester: values.number,
          academic_year: values.academicYear,
        })
        .eq("user_id", userId);
      assertSupabaseResult(profileResult.error, "Não foi possível sincronizar o perfil.");
    }

    return this.getContext(userId);
  },

  async addTeacher(userId: string, input: TeacherInput): Promise<AcademicContext> {
    const values = teacherSchema.parse(input);
    const supabase = createClient();
    const result = await supabase.from("teachers").insert({
      user_id: userId,
      name: values.name,
      email: toNull(values.email),
      department: toNull(values.department),
      notes: toNull(values.notes),
      status: "active",
    });

    assertSupabaseResult(result.error, "Não foi possível cadastrar o professor.");
    return this.getContext(userId);
  },

  async updateTeacher(
    userId: string,
    teacherId: string,
    input: TeacherInput,
  ): Promise<AcademicContext> {
    const values = teacherSchema.parse(input);
    const supabase = createClient();
    const result = await supabase
      .from("teachers")
      .update({
        name: values.name,
        email: toNull(values.email),
        department: toNull(values.department),
        notes: toNull(values.notes),
      })
      .eq("id", teacherId)
      .eq("user_id", userId);

    assertSupabaseResult(result.error, "Não foi possível atualizar o professor.");
    return this.getContext(userId);
  },

  async removeTeacher(userId: string, teacherId: string): Promise<AcademicContext> {
    const supabase = createClient();
    const unlinkResult = await supabase
      .from("subjects")
      .update({ teacher_id: null })
      .eq("teacher_id", teacherId)
      .eq("user_id", userId);
    assertSupabaseResult(unlinkResult.error, "Não foi possível desvincular disciplinas.");

    const deleteResult = await supabase
      .from("teachers")
      .delete()
      .eq("id", teacherId)
      .eq("user_id", userId);
    assertSupabaseResult(deleteResult.error, "Não foi possível remover o professor.");
    return this.getContext(userId);
  },

  async addSubject(userId: string, input: SubjectInput): Promise<AcademicContext> {
    const values = subjectSchema.parse(input);
    const supabase = createClient();
    const current = await this.getContext(userId);
    let teacherId = values.teacherId ?? null;

    if (!teacherId && values.teacherName) {
      const teacherResult = await supabase
        .from("teachers")
        .insert({
          user_id: userId,
          name: values.teacherName,
          email: toNull(values.teacherEmail),
          status: "active",
        })
        .select("id")
        .single();
      assertSupabaseResult(teacherResult.error, "Não foi possível criar o professor.");
      teacherId = teacherResult.data?.id ?? null;
    }

    const subjectResult = await supabase.from("subjects").insert({
      user_id: userId,
      semester_id: current.semester?.id ?? null,
      teacher_id: teacherId,
      name: values.name,
      code: toNull(values.code),
      weekly_hours: values.weeklyHours ?? null,
      difficulty: values.difficulty,
      color: values.color,
      schedule_notes: toNull(values.scheduleNotes),
      status: "active",
    });

    assertSupabaseResult(subjectResult.error, "Não foi possível cadastrar a disciplina.");
    return this.getContext(userId);
  },

  async updateSubject(
    userId: string,
    subjectId: string,
    input: SubjectInput,
  ): Promise<AcademicContext> {
    const values = subjectSchema.parse(input);
    const supabase = createClient();
    let teacherId = values.teacherId ?? null;

    if (!teacherId && values.teacherName) {
      const teacherResult = await supabase
        .from("teachers")
        .insert({
          user_id: userId,
          name: values.teacherName,
          email: toNull(values.teacherEmail),
          status: "active",
        })
        .select("id")
        .single();
      assertSupabaseResult(teacherResult.error, "Não foi possível criar o professor.");
      teacherId = teacherResult.data?.id ?? null;
    }

    const subjectResult = await supabase
      .from("subjects")
      .update({
        teacher_id: teacherId,
        name: values.name,
        code: toNull(values.code),
        weekly_hours: values.weeklyHours ?? null,
        difficulty: values.difficulty,
        color: values.color,
        schedule_notes: toNull(values.scheduleNotes),
      })
      .eq("id", subjectId)
      .eq("user_id", userId);

    assertSupabaseResult(subjectResult.error, "Não foi possível atualizar a disciplina.");
    return this.getContext(userId);
  },

  async archiveSubject(userId: string, subjectId: string): Promise<AcademicContext> {
    return this.updateSubjectStatus(userId, subjectId, "archived");
  },

  async restoreSubject(userId: string, subjectId: string): Promise<AcademicContext> {
    return this.updateSubjectStatus(userId, subjectId, "active");
  },

  async updateSubjectStatus(
    userId: string,
    subjectId: string,
    status: Subject["status"],
  ): Promise<AcademicContext> {
    const supabase = createClient();
    const result = await supabase
      .from("subjects")
      .update({ status })
      .eq("id", subjectId)
      .eq("user_id", userId);

    assertSupabaseResult(result.error, "Não foi possível atualizar o status da disciplina.");
    return this.getContext(userId);
  },

  async removeSubject(userId: string, subjectId: string): Promise<AcademicContext> {
    const supabase = createClient();
    const result = await supabase
      .from("subjects")
      .delete()
      .eq("id", subjectId)
      .eq("user_id", userId);

    assertSupabaseResult(result.error, "Não foi possível remover a disciplina.");
    return this.getContext(userId);
  },

  async clearContext(userId: string): Promise<AcademicContext> {
    const supabase = createClient();
    const tables = [
      "file_extractions",
      "files",
      "subjects",
      "teachers",
      "profiles",
      "semesters",
      "courses",
      "institutions",
      "user_settings",
    ] as const;

    for (const table of tables) {
      const result = await supabase.from(table).delete().eq("user_id", userId);
      assertSupabaseResult(result.error, `Não foi possível limpar ${table}.`);
    }

    return emptyContext();
  },
};
