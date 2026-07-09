import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function ErrorLayout({
  title,
  description,
  actionLabel,
  onAction,
  action,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <Logo />
      <div className="flex max-w-lg flex-col gap-3">
        <h1 className="text-4xl font-semibold">{title}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ??
        (actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null)}
    </main>
  );
}
