import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3 text-foreground", className)}>
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span className="text-sm font-black">SP</span>
      </span>
      <span className="text-base font-semibold tracking-normal">StudyPilot AI</span>
    </Link>
  );
}
