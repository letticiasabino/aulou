import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AcademicCalendar } from "@/features/calendar/components/academic-calendar";

export default function CalendarPage() {
  return (
    <DashboardLayout title="Agenda">
      <AcademicCalendar />
    </DashboardLayout>
  );
}
