import {
  academicProfileSchema,
  subjectSchema,
  type AcademicProfileInput,
  type NormalizedAcademicProfileInput,
  type NormalizedSubjectInput,
  type SubjectInput,
} from "@/features/academic/schemas/academic-profile-schema";
import type {
  AcademicContext,
  AcademicContextSummary,
  AcademicProfile,
  Course,
  Semester,
  Subject,
  Teacher,
} from "@/types/academic-domain";

const storagePrefix = "studypilot.academic-context";
const defaultTimezone = "America/Sao_Paulo";

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

function storageKey(userId: string) {
  return `${storagePrefix}.${userId}`;
}

function emptyContext(): AcademicContext {
  return {
    profile: null,
    course: null,
    semester: null,
    teachers: [],
    subjects: [],
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readContext(userId: string): AcademicContext {
  if (!canUseStorage()) {
    return emptyContext();
  }

  const raw = window.localStorage.getItem(storageKey(userId));

  if (!raw) {
    return emptyContext();
  }

  try {
    return { ...emptyContext(), ...(JSON.parse(raw) as AcademicContext) };
  } catch {
    return emptyContext();
  }
}

function writeContext(userId: string, context: AcademicContext) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(storageKey(userId), JSON.stringify(context));
}

function upsertTeacher(
  userId: string,
  teachers: Teacher[],
  subject: NormalizedSubjectInput,
): { teachers: Teacher[]; teacherId: string | null } {
  if (!subject.teacherName) {
    return { teachers, teacherId: null };
  }

  const existing = teachers.find(
    (teacher) => teacher.name.toLowerCase() === subject.teacherName?.toLowerCase(),
  );

  if (existing) {
    return { teachers, teacherId: existing.id };
  }

  const timestamp = now();
  const teacher: Teacher = {
    id: createId("teacher"),
    userId,
    name: subject.teacherName,
    email: subject.teacherEmail,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return { teachers: [...teachers, teacher], teacherId: teacher.id };
}

function buildCourse(
  userId: string,
  input: NormalizedAcademicProfileInput,
  existing?: Course | null,
): Course {
  const timestamp = now();

  return {
    id: existing?.id ?? createId("course"),
    userId,
    name: input.courseName,
    institutionName: input.institutionName,
    degree: existing?.degree,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function buildSemester(
  userId: string,
  courseId: string,
  input: NormalizedAcademicProfileInput,
  existing?: Semester | null,
): Semester {
  const timestamp = now();

  return {
    id: existing?.id ?? createId("semester"),
    userId,
    courseId,
    label: `${input.currentSemester}º semestre - ${input.academicYear}`,
    number: input.currentSemester,
    startsOn: existing?.startsOn ?? null,
    endsOn: existing?.endsOn ?? null,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

export const academicService = {
  async getContext(userId: string): Promise<AcademicContext> {
    return readContext(userId);
  },

  async saveProfile(userId: string, input: AcademicProfileInput): Promise<AcademicContext> {
    const values = academicProfileSchema.parse(input);
    const current = readContext(userId);
    const timestamp = now();
    const course = buildCourse(userId, values, current.course);
    const semester = buildSemester(userId, course.id, values, current.semester);
    const profile: AcademicProfile = {
      userId,
      displayName: values.displayName,
      institutionName: values.institutionName,
      courseName: values.courseName,
      currentSemester: values.currentSemester,
      academicYear: values.academicYear,
      timezone: values.timezone || defaultTimezone,
      onboardingCompletedAt: current.profile?.onboardingCompletedAt ?? timestamp,
      updatedAt: timestamp,
    };

    const nextContext = {
      ...current,
      profile,
      course,
      semester,
    };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async addSubject(userId: string, input: SubjectInput): Promise<AcademicContext> {
    const values = subjectSchema.parse(input);
    const current = readContext(userId);
    const timestamp = now();
    const teacherState = upsertTeacher(userId, current.teachers, values);
    const subject: Subject = {
      id: createId("subject"),
      userId,
      semesterId: current.semester?.id ?? null,
      teacherId: teacherState.teacherId,
      name: values.name,
      code: values.code,
      weeklyHours: values.weeklyHours,
      difficulty: values.difficulty as Subject["difficulty"],
      color: values.color,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const nextContext = {
      ...current,
      teachers: teacherState.teachers,
      subjects: [...current.subjects, subject],
    };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async removeSubject(userId: string, subjectId: string): Promise<AcademicContext> {
    const current = readContext(userId);
    const nextContext = {
      ...current,
      subjects: current.subjects.filter((subject) => subject.id !== subjectId),
    };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async clearContext(userId: string): Promise<AcademicContext> {
    const nextContext = emptyContext();
    writeContext(userId, nextContext);
    return nextContext;
  },

  summarize(context: AcademicContext): AcademicContextSummary {
    const activeSubjects = context.subjects.filter((subject) => subject.status === "active");
    const totalDifficulty = activeSubjects.reduce((sum, subject) => sum + subject.difficulty, 0);

    return {
      hasCompletedOnboarding: Boolean(context.profile?.onboardingCompletedAt),
      subjectCount: activeSubjects.length,
      teacherCount: context.teachers.length,
      averageDifficulty: activeSubjects.length
        ? Number((totalDifficulty / activeSubjects.length).toFixed(1))
        : 0,
      weeklyHours: activeSubjects.reduce((sum, subject) => sum + (subject.weeklyHours ?? 0), 0),
    };
  },
};
