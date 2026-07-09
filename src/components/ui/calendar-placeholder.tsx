import { Skeleton } from "@/components/ui/skeleton";

export function CalendarPlaceholder() {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square rounded-md" />
        ))}
      </div>
    </div>
  );
}
