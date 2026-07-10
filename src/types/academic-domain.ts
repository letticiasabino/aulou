export type SubjectDifficulty = 1 | 2 | 3 | 4 | 5;
export type AcademicRecordStatus = "active" | "archived";

export type Institution = {
  id: string;
  userId: string;
  name: string;
  campus?: string;
  city?: string;
  country: string;
  createdAt: string;
  updatedAt: string;
};

export type AcademicProfile = {
  userId: string;
  institutionId: string | null;
  courseId: string | null;
  semesterId: string | null;
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
  institutionId: string | null;
  name: string;
  institutionName: string;
  degree?: string;
  status: AcademicRecordStatus;
  createdAt: string;
  updatedAt: string;
};

export type Semester = {
  id: string;
  userId: string;
  courseId: string | null;
  label: string;
  number: number;
  academicYear: number;
  startsOn: string | null;
  endsOn: string | null;
  status: AcademicRecordStatus;
  createdAt: string;
  updatedAt: string;
};

export type Teacher = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  department?: string;
  notes?: string;
  status: AcademicRecordStatus;
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
  scheduleNotes?: string;
  status: AcademicRecordStatus;
  createdAt: string;
  updatedAt: string;
};

export type AcademicContext = {
  profile: AcademicProfile | null;
  institution: Institution | null;
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
