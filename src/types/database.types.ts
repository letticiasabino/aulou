export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type AcademicStatus = "active" | "archived";
type FileStatus = "uploaded" | "processing" | "processed" | "failed" | "deleted";
type ExtractionStatus = "pending" | "processing" | "completed" | "failed";
type SubscriptionPlan = "free" | "plus" | "pro" | "early_access";

type TimestampColumns = {
  created_at: string;
  updated_at: string;
};

type BaseInsert = {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

type OwnerColumn = {
  user_id: string;
};

export type InstitutionRow = OwnerColumn &
  TimestampColumns & {
    id: string;
    name: string;
    campus: string | null;
    city: string | null;
    country: string;
  };

export type CourseRow = OwnerColumn &
  TimestampColumns & {
    id: string;
    institution_id: string | null;
    name: string;
    institution_name: string;
    degree: string | null;
    status: AcademicStatus;
  };

export type SemesterRow = OwnerColumn &
  TimestampColumns & {
    id: string;
    course_id: string | null;
    label: string;
    number: number;
    academic_year: number;
    starts_on: string | null;
    ends_on: string | null;
    status: AcademicStatus;
  };

export type ProfileRow = OwnerColumn &
  TimestampColumns & {
    id: string;
    institution_id: string | null;
    course_id: string | null;
    semester_id: string | null;
    display_name: string;
    institution_name: string;
    course_name: string;
    current_semester: number;
    academic_year: number;
    timezone: string;
    onboarding_completed_at: string | null;
  };

export type TeacherRow = OwnerColumn &
  TimestampColumns & {
    id: string;
    name: string;
    email: string | null;
    department: string | null;
    notes: string | null;
    status: AcademicStatus;
  };

export type SubjectRow = OwnerColumn &
  TimestampColumns & {
    id: string;
    semester_id: string | null;
    teacher_id: string | null;
    name: string;
    code: string | null;
    weekly_hours: number | null;
    difficulty: number;
    color: string;
    schedule_notes: string | null;
    status: AcademicStatus;
  };

export type FileRow = OwnerColumn &
  TimestampColumns & {
    id: string;
    subject_id: string | null;
    storage_bucket: string;
    storage_path: string;
    original_name: string;
    content_type: string;
    size_bytes: number;
    checksum: string | null;
    status: FileStatus;
    consent_for_ai_at: string | null;
    deleted_at: string | null;
  };

export type FileExtractionRow = OwnerColumn &
  TimestampColumns & {
    id: string;
    file_id: string;
    raw_text: string | null;
    structured_payload: Json | null;
    provider: string | null;
    status: ExtractionStatus;
    safe_error: string | null;
    token_count: number | null;
  };

export type UserSettingsRow = OwnerColumn &
  TimestampColumns & {
    id: string;
    theme: string;
    timezone: string;
    notifications_enabled: boolean;
    automatic_import_enabled: boolean;
  };

export type SubscriptionRow = OwnerColumn &
  TimestampColumns & {
    id: string;
    plan: SubscriptionPlan;
    status: string;
    provider: string | null;
    provider_customer_id: string | null;
    provider_subscription_id: string | null;
    current_period_ends_at: string | null;
  };

export type UsageLimitRow = OwnerColumn &
  TimestampColumns & {
    id: string;
    period_start: string;
    period_end: string;
    uploads_count: number;
    ai_requests_count: number;
    flashcards_count: number;
    quizzes_count: number;
  };

export type AuditLogRow = OwnerColumn & {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Json;
  created_at: string;
};

type Table<Row, Insert extends Record<string, unknown> = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type Insertable<Row extends OwnerColumn> = BaseInsert &
  OwnerColumn &
  Partial<Omit<Row, keyof TimestampColumns | "id" | "user_id">>;

export type Database = {
  public: {
    Tables: {
      institutions: Table<InstitutionRow, Insertable<InstitutionRow>>;
      courses: Table<CourseRow, Insertable<CourseRow>>;
      semesters: Table<SemesterRow, Insertable<SemesterRow>>;
      profiles: Table<ProfileRow, Insertable<ProfileRow>>;
      teachers: Table<TeacherRow, Insertable<TeacherRow>>;
      subjects: Table<SubjectRow, Insertable<SubjectRow>>;
      files: Table<FileRow, Insertable<FileRow>>;
      file_extractions: Table<FileExtractionRow, Insertable<FileExtractionRow>>;
      user_settings: Table<UserSettingsRow, Insertable<UserSettingsRow>>;
      subscriptions: Table<SubscriptionRow, Insertable<SubscriptionRow>>;
      usage_limits: Table<UsageLimitRow, Insertable<UsageLimitRow>>;
      audit_logs: Table<AuditLogRow, OwnerColumn & Partial<Omit<AuditLogRow, "user_id">>>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
