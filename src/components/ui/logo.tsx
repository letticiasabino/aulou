import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3 text-foreground", className)}>
      <Image
        src="/brand/aulou-icon.png"
        alt="Aulou"
        width={36}
        height={36}
        className="size-9 rounded-lg object-cover"
      />
      <span className="text-base font-semibold tracking-normal">Aulou</span>
    </Link>
  );
}
