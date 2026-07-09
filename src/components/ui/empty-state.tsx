import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  const action = actionHref ? (
    <Button asChild variant="secondary">
      <Link href={actionHref}>{actionLabel}</Link>
    </Button>
  ) : (
    <Button variant="secondary">{actionLabel}</Button>
  );

  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border bg-card p-8 text-center">
      {Icon ? <Icon className="text-primary" aria-hidden="true" /> : null}
      <div className="flex max-w-md flex-col gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actionLabel ? action : null}
    </div>
  );
}
