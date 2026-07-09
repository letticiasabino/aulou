export type SubjectDifficulty = 1 | 2 | 3 | 4 | 5;

export type AcademicProfile = {
  userId: string;
  displayName: string;
  institutionName: string;
  courseName: string;
  currentSemester: number;
  academicYear: number;
  timezone: string;
  onboardingCompletedAt: string | null;
  updatedAt: string;
};

export type Course = {
  id: string;
  userId: string;
  name: string;
  institutionName: string;
  degree?: string;
  createdAt: string;
  updatedAt: string;
};

export type Semester = {
  id: string;
  userId: string;
  courseId: string | null;
  label: string;
  number: number;
  startsOn: string | null;
  endsOn: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Teacher = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
};

export type Subject = {
  id: string;
  userId: string;
  semesterId: string | null;
  teacherId: string | null;
  name: string;
  code?: string;
  weeklyHours?: number;
  difficulty: SubjectDifficulty;
  color: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type AcademicContext = {
  profile: AcademicProfile | null;
  course: Course | null;
  semester: Semester | null;
  teachers: Teacher[];
  subjects: Subject[];
};

export type AcademicContextSummary = {
  hasCompletedOnboarding: boolean;
  subjectCount: number;
  teacherCount: number;
  averageDifficulty: number;
  weeklyHours: number;
};
