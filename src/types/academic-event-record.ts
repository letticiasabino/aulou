import type { AcademicEvent } from "@/types/academic";

export type AcademicEventFilters = {
  subjectName?: string;
  eventType?: AcademicEvent["eventType"];
  from?: string;
  to?: string;
};

export type AcademicEventRecord = AcademicEvent & {
  createdAt: string;
  updatedAt: string;
};
