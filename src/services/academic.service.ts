import {
  academicProfileSchema,
  courseSchema,
  institutionSchema,
  semesterSchema,
  subjectSchema,
  teacherSchema,
  type AcademicProfileInput,
  type CourseInput,
  type NormalizedCourseInput,
  type NormalizedInstitutionInput,
  type NormalizedSemesterInput,
  type NormalizedSubjectInput,
  type NormalizedTeacherInput,
  type SemesterInput,
  type SubjectInput,
  type TeacherInput,
  type InstitutionInput,
} from "@/features/academic/schemas/academic-profile-schema";
import type {
  AcademicContext,
  AcademicContextSummary,
  AcademicProfile,
  Course,
  Institution,
  Semester,
  Subject,
  Teacher,
} from "@/types/academic-domain";

const storagePrefix = "studypilot.academic-context";
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

function storageKey(userId: string) {
  return `${storagePrefix}.${userId}`;
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

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function writeContext(userId: string, context: AcademicContext) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(storageKey(userId), JSON.stringify(context));
}

function normalizeContext(userId: string, rawContext: Partial<AcademicContext>): AcademicContext {
  const timestamp = now();
  let institution = rawContext.institution ?? null;

  if (!institution && rawContext.profile?.institutionName) {
    institution = {
      id: createId("institution"),
      userId,
      name: rawContext.profile.institutionName,
      country: defaultCountry,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  const course = rawContext.course
    ? {
        ...rawContext.course,
        userId,
        institutionId: rawContext.course.institutionId ?? institution?.id ?? null,
        status: rawContext.course.status ?? "active",
      }
    : null;

  const semester = rawContext.semester
    ? {
        ...rawContext.semester,
        userId,
        courseId: rawContext.semester.courseId ?? course?.id ?? null,
        academicYear:
          rawContext.semester.academicYear ??
          rawContext.profile?.academicYear ??
          new Date().getFullYear(),
        status: rawContext.semester.status ?? "active",
      }
    : null;

  const profile = rawContext.profile
    ? {
        ...rawContext.profile,
        userId,
        institutionId: rawContext.profile.institutionId ?? institution?.id ?? null,
        courseId: rawContext.profile.courseId ?? course?.id ?? null,
        semesterId: rawContext.profile.semesterId ?? semester?.id ?? null,
        timezone: rawContext.profile.timezone || defaultTimezone,
      }
    : null;

  return {
    profile,
    institution,
    course,
    semester,
    teachers: (rawContext.teachers ?? []).map((teacher) => ({
      ...teacher,
      userId,
      status: teacher.status ?? "active",
    })),
    subjects: (rawContext.subjects ?? []).map((subject) => ({
      ...subject,
      userId,
      status: subject.status ?? "active",
    })),
  };
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
    const context = normalizeContext(userId, JSON.parse(raw) as Partial<AcademicContext>);
    writeContext(userId, context);
    return context;
  } catch {
    return emptyContext();
  }
}

function buildInstitution(
  userId: string,
  input: NormalizedInstitutionInput,
  existing?: Institution | null,
): Institution {
  const timestamp = now();

  return {
    id: existing?.id ?? createId("institution"),
    userId,
    name: input.name,
    campus: input.campus,
    city: input.city,
    country: input.country || defaultCountry,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function buildCourse(
  userId: string,
  institution: Institution | null,
  input: NormalizedCourseInput,
  existing?: Course | null,
): Course {
  const timestamp = now();

  return {
    id: existing?.id ?? createId("course"),
    userId,
    institutionId: institution?.id ?? null,
    name: input.name,
    institutionName: institution?.name ?? existing?.institutionName ?? "",
    degree: input.degree,
    status: existing?.status ?? "active",
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function buildSemester(
  userId: string,
  courseId: string | null,
  input: NormalizedSemesterInput,
  existing?: Semester | null,
): Semester {
  const timestamp = now();

  return {
    id: existing?.id ?? createId("semester"),
    userId,
    courseId,
    label: `${input.number}º semestre - ${input.academicYear}`,
    number: input.number,
    academicYear: input.academicYear,
    startsOn: input.startsOn ?? null,
    endsOn: input.endsOn ?? null,
    status: existing?.status ?? "active",
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function upsertTeacherFromSubject(
  userId: string,
  teachers: Teacher[],
  subject: NormalizedSubjectInput,
): { teachers: Teacher[]; teacherId: string | null } {
  if (subject.teacherId) {
    const existing = teachers.find((teacher) => teacher.id === subject.teacherId);
    return { teachers, teacherId: existing?.id ?? null };
  }

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
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return { teachers: [...teachers, teacher], teacherId: teacher.id };
}

function buildTeacher(userId: string, input: NormalizedTeacherInput, existing?: Teacher): Teacher {
  const timestamp = now();

  return {
    id: existing?.id ?? createId("teacher"),
    userId,
    name: input.name,
    email: input.email,
    department: input.department,
    notes: input.notes,
    status: existing?.status ?? "active",
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
    const institution = buildInstitution(
      userId,
      {
        name: values.institutionName,
        country: current.institution?.country ?? defaultCountry,
        campus: current.institution?.campus,
        city: current.institution?.city,
      },
      current.institution,
    );
    const course = buildCourse(
      userId,
      institution,
      { name: values.courseName, degree: current.course?.degree },
      current.course,
    );
    const semester = buildSemester(
      userId,
      course.id,
      {
        number: values.currentSemester,
        academicYear: values.academicYear,
        startsOn: current.semester?.startsOn ?? undefined,
        endsOn: current.semester?.endsOn ?? undefined,
      },
      current.semester,
    );
    const profile: AcademicProfile = {
      userId,
      institutionId: institution.id,
      courseId: course.id,
      semesterId: semester.id,
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
      institution,
      course,
      semester,
    };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async saveInstitution(userId: string, input: InstitutionInput): Promise<AcademicContext> {
    const values = institutionSchema.parse(input);
    const current = readContext(userId);
    const institution = buildInstitution(userId, values, current.institution);
    const timestamp = now();
    const course = current.course
      ? {
          ...current.course,
          institutionId: institution.id,
          institutionName: institution.name,
          updatedAt: timestamp,
        }
      : current.course;
    const profile = current.profile
      ? {
          ...current.profile,
          institutionId: institution.id,
          institutionName: institution.name,
          updatedAt: timestamp,
        }
      : current.profile;
    const nextContext = { ...current, institution, course, profile };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async saveCourse(userId: string, input: CourseInput): Promise<AcademicContext> {
    const values = courseSchema.parse(input);
    const current = readContext(userId);
    const institution = current.institution;
    const course = buildCourse(userId, institution, values, current.course);
    const timestamp = now();
    const semester = current.semester
      ? { ...current.semester, courseId: course.id, updatedAt: timestamp }
      : current.semester;
    const profile = current.profile
      ? {
          ...current.profile,
          courseId: course.id,
          courseName: course.name,
          updatedAt: timestamp,
        }
      : current.profile;
    const nextContext = { ...current, course, semester, profile };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async saveSemester(userId: string, input: SemesterInput): Promise<AcademicContext> {
    const values = semesterSchema.parse(input);
    const current = readContext(userId);
    const semester = buildSemester(userId, current.course?.id ?? null, values, current.semester);
    const timestamp = now();
    const profile = current.profile
      ? {
          ...current.profile,
          semesterId: semester.id,
          currentSemester: semester.number,
          academicYear: semester.academicYear,
          updatedAt: timestamp,
        }
      : current.profile;
    const nextContext = { ...current, semester, profile };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async addTeacher(userId: string, input: TeacherInput): Promise<AcademicContext> {
    const values = teacherSchema.parse(input);
    const current = readContext(userId);
    const teacher = buildTeacher(userId, values);
    const nextContext = { ...current, teachers: [...current.teachers, teacher] };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async updateTeacher(
    userId: string,
    teacherId: string,
    input: TeacherInput,
  ): Promise<AcademicContext> {
    const values = teacherSchema.parse(input);
    const current = readContext(userId);
    const teachers = current.teachers.map((teacher) =>
      teacher.id === teacherId ? buildTeacher(userId, values, teacher) : teacher,
    );
    const nextContext = { ...current, teachers };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async removeTeacher(userId: string, teacherId: string): Promise<AcademicContext> {
    const current = readContext(userId);
    const timestamp = now();
    const nextContext = {
      ...current,
      teachers: current.teachers.filter((teacher) => teacher.id !== teacherId),
      subjects: current.subjects.map((subject) =>
        subject.teacherId === teacherId
          ? { ...subject, teacherId: null, updatedAt: timestamp }
          : subject,
      ),
    };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async addSubject(userId: string, input: SubjectInput): Promise<AcademicContext> {
    const values = subjectSchema.parse(input);
    const current = readContext(userId);
    const timestamp = now();
    const teacherState = upsertTeacherFromSubject(userId, current.teachers, values);
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
      scheduleNotes: values.scheduleNotes,
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

  async updateSubject(
    userId: string,
    subjectId: string,
    input: SubjectInput,
  ): Promise<AcademicContext> {
    const values = subjectSchema.parse(input);
    const current = readContext(userId);
    const teacherState = upsertTeacherFromSubject(userId, current.teachers, values);
    const timestamp = now();
    const subjects = current.subjects.map((subject) =>
      subject.id === subjectId
        ? {
            ...subject,
            teacherId: teacherState.teacherId,
            name: values.name,
            code: values.code,
            weeklyHours: values.weeklyHours,
            difficulty: values.difficulty as Subject["difficulty"],
            color: values.color,
            scheduleNotes: values.scheduleNotes,
            updatedAt: timestamp,
          }
        : subject,
    );
    const nextContext = { ...current, teachers: teacherState.teachers, subjects };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async archiveSubject(userId: string, subjectId: string): Promise<AcademicContext> {
    const current = readContext(userId);
    const timestamp = now();
    const subjects = current.subjects.map((subject) =>
      subject.id === subjectId
        ? { ...subject, status: "archived" as const, updatedAt: timestamp }
        : subject,
    );
    const nextContext = { ...current, subjects };

    writeContext(userId, nextContext);
    return nextContext;
  },

  async restoreSubject(userId: string, subjectId: string): Promise<AcademicContext> {
    const current = readContext(userId);
    const timestamp = now();
    const subjects = current.subjects.map((subject) =>
      subject.id === subjectId
        ? { ...subject, status: "active" as const, updatedAt: timestamp }
        : subject,
    );
    const nextContext = { ...current, subjects };

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
    const activeTeachers = context.teachers.filter((teacher) => teacher.status === "active");
    const totalDifficulty = activeSubjects.reduce((sum, subject) => sum + subject.difficulty, 0);

    return {
      hasCompletedOnboarding: Boolean(context.profile?.onboardingCompletedAt),
      subjectCount: activeSubjects.length,
      teacherCount: activeTeachers.length,
      averageDifficulty: activeSubjects.length
        ? Number((totalDifficulty / activeSubjects.length).toFixed(1))
        : 0,
      weeklyHours: activeSubjects.reduce((sum, subject) => sum + (subject.weeklyHours ?? 0), 0),
    };
  },
};
