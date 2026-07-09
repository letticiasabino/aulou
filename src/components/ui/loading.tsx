import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Loading({
  label = "Carregando",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Loader2 className="animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function PageLoading({ label }: { label: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Loading label={label} />
    </main>
  );
}
